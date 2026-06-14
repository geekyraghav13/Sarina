/**
 * Onboarding · Screen 09 — Chat
 * New flow design (Figma node 39:983)
 *
 * UI-only for now (Expo-Go-safe): renders the chat per the Figma — top app bar
 * with the companion's avatar/name/Online status, a message canvas with AI/user
 * bubbles + animated typing indicator, suggested-reply chips, and a composer.
 * Sending appends the user's bubble locally; there is NO AI backend wired yet
 * (that comes next). The seed conversation matches the Figma mockup.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Pressable,
  Linking,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { useTranslation } from 'react-i18next';
import {
  logScreenView,
  logChatStart,
  logMessageSent,
  logMessageMilestone,
  logFreeLimitReached,
  logStoryViewed,
  logChatSessionEnd,
  logPaywallViewed,
} from '../../services/firebaseAnalytics';
import { useSoftReviewPrompt } from '../../hooks/useSoftReviewPrompt';
import { useChatStrings, interpolate } from '../../data/onboardingStrings';
import { Character, characterImageSource } from '../../data/characters';
import { getStory } from '../../data/stories';
import { generateReply, generateNotifications, ChatTurn } from '../../services/chatApi';
import { pauseCycle, recordActivity, updateAppOpen, PendingNotifications } from '../../services/userEngagementService';
import { loadConversation, saveConversation, clearConversation, StoredTurn } from '../../services/chatHistoryService';
import { usePaymentStore, FREE_MESSAGE_LIMIT } from '../../store/paymentStore';

// After this many user messages in a session, surface the soft review prompt
// (engagement peak). Cooldown-gated so it only ever shows to genuine fans.
const REVIEW_AT_MESSAGE = 12;

// After this many user messages, "she" calls the user — an incoming call that
// lands non-premium users on the paywall (conversion hook). Fires once.
const AUTO_CALL_AT_MESSAGE = 2;

// Where "Report conversation" (3-dot menu) sends the report email.
const REPORT_EMAIL = 'helpjalpat@gmail.com';
import { auth } from '../../config/firebase';
import { presentPaywall } from '../../services/paywall';

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Chat'>;
  route: RouteProp<OnboardingStackParamList, 'Chat'>;
};

type Sender = 'ai' | 'user';
type Message = { id: string; sender: Sender; text: string; ts: number };

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

/** Three pulsing dots — the "she's typing" indicator. */
const TypingIndicator: React.FC = () => {
  const dots = React.useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  React.useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[styles.typingDot, { opacity: d }]} />
      ))}
    </View>
  );
};

export const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const paramCharacter = route.params?.character;
  const insets = useSafeAreaInsets();
  const strings = useChatStrings();
  const { i18n } = useTranslation();
  const scrollRef = React.useRef<ScrollView>(null);

  const [character, setCharacter] = React.useState<Character | null>(null);
  const [userName, setUserName] = React.useState('You');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [timestamp] = React.useState(() => formatTime(new Date()));
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [kbOpen, setKbOpen] = React.useState(false);

  // Track the keyboard so we can collapse the bottom safe-area inset while it's
  // open (otherwise KeyboardAvoidingView leaves a nav-bar-sized gap above it).
  React.useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKbOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Peak moment #2: a user who's exchanged a dozen messages is genuinely
  // engaged — ask for a review. Cooldown-gated so it never double-prompts with
  // the character-select prompt. Fires once per session via the ref guard.
  const { showIfEligible, promptElement } = useSoftReviewPrompt('chat_engaged');
  // Returning to a chat that already has history is itself a fan signal — ask
  // for a review when a previous conversation is opened (cooldown-gated).
  const { showIfEligible: showReopenReview, promptElement: reopenPromptElement } =
    useSoftReviewPrompt('previous_chat_opened');
  const reviewAskedRef = React.useRef(false);
  const chatStartLoggedRef = React.useRef(false);
  const autoCallFiredRef = React.useRef(false);
  const freeLimitLoggedRef = React.useRef(false);
  // Session-depth tracking for chat_session_end (refs avoid stale closures).
  const sessionStartRef = React.useRef(Date.now());
  const userMsgCountRef = React.useRef(0);
  const sessionCharRef = React.useRef<Character | null>(null);

  // Freemium (global 10-message limit via paymentStore).
  const isPremium = usePaymentStore((s) => s.isPremium);
  const freeUsed = usePaymentStore((s) => s.freeMessagesCount);
  const loadSubscriptionStatus = usePaymentStore((s) => s.loadSubscriptionStatus);
  const incrementFreeMessages = usePaymentStore((s) => s.incrementFreeMessages);
  const setIsPremium = usePaymentStore((s) => s.setIsPremium);
  const reachedLimit = !isPremium && freeUsed >= FREE_MESSAGE_LIMIT;

  // Keep a ref of the active character so the unmount handler (below) can read it
  // without a stale closure.
  React.useEffect(() => {
    sessionCharRef.current = character;
  }, [character]);

  // Emit chat_session_end on leave (duration + how many messages the user sent),
  // but only for sessions where the user actually engaged (≥1 message).
  React.useEffect(() => {
    sessionStartRef.current = Date.now();
    return () => {
      if (userMsgCountRef.current > 0) {
        const dur = Math.round((Date.now() - sessionStartRef.current) / 1000);
        const c = sessionCharRef.current;
        logChatSessionEnd(c?.name || 'Sarina', dur, userMsgCountRef.current, c?.id);
      }
    };
  }, []);

  // Initialize RevenueCat, bind the current user, and refresh premium status.
  // All native (react-native-purchases) → lazy-required + guarded so the screen
  // still loads in Expo Go (where it simply no-ops).
  React.useEffect(() => {
    (async () => {
      try {
        const rc = require('../../services/revenueCatService');
        await rc.initializeRevenueCat();
        const uid = auth.currentUser?.uid;
        if (uid) await rc.loginRevenueCatUser(uid);
        const premium = await rc.checkPremiumStatus();
        await setIsPremium(!!premium);
        // Refill the per-plan call-credit bucket if a new billing period started
        // (client-side renewal detection). No-op within the same period.
        if (premium) {
          try {
            await rc.syncVoiceAllowance();
          } catch {}
        }
      } catch (e: any) {
        console.log('[Chat] RevenueCat init skipped:', e?.message);
      }
    })();
  }, []);

  // Load the chosen character + user's name, then seed the localized story.
  React.useEffect(() => {
    logScreenView('Onboarding_Chat');
    loadSubscriptionStatus();
    (async () => {
      // Character comes from the route param (opened from Home) or, on the
      // onboarding path, from the previously selected character in storage.
      let char: Character | null = paramCharacter ?? null;
      try {
        const [rawChar, savedName] = await Promise.all([
          AsyncStorage.getItem('selected_character'),
          AsyncStorage.getItem('user_name'),
        ]);
        if (!char && rawChar) char = JSON.parse(rawChar);
        if (savedName) setUserName(savedName);
        if (char) setCharacter(char);
      } catch {}

      if (!chatStartLoggedRef.current) {
        chatStartLoggedRef.current = true;
        logChatStart(char?.name || 'Sarina', char?.id, char?.categories?.[0]);
        logStoryViewed(char?.id);
      }

      const story = char?.story?.length
        ? char.story
        : getStory(char?.id, i18n.language, char?.name || 'Sarina');
      const storyMsgs: Message[] = story.map((text, i) => ({
        id: `story-${i}`,
        sender: 'ai' as const,
        text,
        ts: 0,
      }));

      // Append any previously saved conversation turns after the fresh story.
      let saved: StoredTurn[] = [];
      if (char?.id) saved = await loadConversation(char.id);
      const savedMsgs: Message[] = saved.map((t, i) => ({
        id: `h-${i}`,
        sender: t.sender,
        text: t.text,
        ts: t.ts,
      }));

      setMessages([...storyMsgs, ...savedMsgs]);

      // Opening a chat that already has saved history = a returning, engaged
      // user → surface the soft review prompt (cooldown-gated).
      if (saved.length > 0) {
        showReopenReview();
      }
    })();
  }, []);

  // Persist the real conversation turns (everything except the story bubbles).
  const persist = (msgs: Message[]) => {
    if (!character?.id) return;
    const turns: StoredTurn[] = msgs
      .filter((m) => !m.id.startsWith('story-'))
      .map((m) => ({ sender: m.sender, text: m.text, ts: m.ts }));
    saveConversation(character.id, turns);
  };

  const name = character?.name || 'Sarina';

  // ── Re-engagement push cycle ───────────────────────────────────────────────
  // Re-engagement: the cycle is (re)armed after each AI reply while the app is
  // FOREGROUND (reliable — no dependency on catching a background/leave event).
  // recordActivity sets nextNotifyAt = now + 3h, so while the user keeps chatting
  // it's pushed forward, and when they stop it fires 3h after the last message.
  // Entering the chat cancels any prior cycle. pendingRef caches the generated
  // notifications so we don't call Gemini on every single message.
  const pendingRef = React.useRef<PendingNotifications | null>(null);
  const lastGenRef = React.useRef(0);

  React.useEffect(() => {
    pauseCycle(); // active in this chat → cancel any pending cycle
    // Ask for push permission when the user lands in chat (post-onboarding),
    // and save the FCM token. Idempotent — only prompts if not yet granted.
    (async () => {
      try {
        const token = await require('../../services/notificationService').registerForPushNotifications();
        updateAppOpen(token);
      } catch {}
    })();
  }, []);

  // Generate (or reuse cached) notifications, then arm/refresh the cycle.
  const armReengagement = async (userMsgs: string[]) => {
    if (!character || userMsgs.length === 0) return;
    try {
      let notifs = pendingRef.current;
      if (!notifs || Date.now() - lastGenRef.current > 90_000) {
        const fresh = await generateNotifications(character, userName, userMsgs, i18n.language);
        if (fresh) {
          notifs = fresh;
          pendingRef.current = fresh;
          lastGenRef.current = Date.now();
        }
      }
      await recordActivity({
        characterId: character.id,
        characterName: character.name,
        userName,
        lastMessages: userMsgs,
        notifications: notifs || undefined,
      });
    } catch (e) {
      console.warn('[Chat] armReengagement failed', e);
    }
  };

  // Present the RevenueCat paywall; on purchase/restore refresh premium & unlock.
  const openPaywall = async () => {
    logPaywallViewed('chat_free_limit');
    const result = await presentPaywall();
    if (result === null) {
      Alert.alert(
        'Upgrade unavailable',
        'Subscriptions need a dev/production build (not Expo Go). Please try on the installed app.'
      );
      return;
    }
    await setIsPremium(result);
  };

  // Tapping the call button starts the incoming-call → paywall/call flow.
  const openCall = () => {
    navigation.navigate('IncomingCall', { character: character ?? undefined });
  };

  // ── 3-dot menu actions ─────────────────────────────────────────────────────
  // Delete: wipe the saved conversation (local + cloud) and reset the canvas to
  // just the fresh opening story.
  const handleDelete = () => {
    setMenuOpen(false);
    Alert.alert(
      strings.deleteTitle,
      interpolate(strings.deleteBody, { name }),
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.deleteConfirm,
          style: 'destructive',
          onPress: async () => {
            if (character?.id) {
              try {
                await clearConversation(character.id);
              } catch {}
            }
            const story = character?.story?.length
              ? character.story
              : getStory(character?.id, i18n.language, name);
            setMessages(
              story.map((text, i) => ({ id: `story-${i}`, sender: 'ai' as const, text, ts: 0 }))
            );
            pendingRef.current = null;
            autoCallFiredRef.current = false;
            reviewAskedRef.current = false;
          },
        },
      ]
    );
  };

  // Report: open the user's mail app pre-filled to support with a transcript of
  // the real conversation (story bubbles excluded) for context.
  const handleReport = async () => {
    setMenuOpen(false);
    const transcript = messages
      .filter((m) => !m.id.startsWith('story-'))
      .slice(-30)
      .map((m) => `${m.sender === 'user' ? userName : name}: ${m.text}`)
      .join('\n');
    const uid = auth.currentUser?.uid || 'unknown';
    const subject = `Report a conversation — ${name}`;
    const body =
      `Please describe the issue:\n\n\n` +
      `------------------------------\n` +
      `Reported character: ${name}\n` +
      `User: ${userName}\n` +
      `User ID: ${uid}\n` +
      `App: Sarina\n\n` +
      `Recent conversation:\n${transcript || '(no messages yet)'}`;
    const url = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(strings.menuReport, `${REPORT_EMAIL}`);
    }
  };

  // Upgrade: present the main subscription paywall.
  const handleUpgrade = () => {
    setMenuOpen(false);
    openPaywall();
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    // Freemium gate — block once the free allowance is spent.
    if (reachedLimit) {
      if (!freeLimitLoggedRef.current) {
        freeLimitLoggedRef.current = true;
        logFreeLimitReached(character?.id);
      }
      openPaywall();
      return;
    }

    const userMsg: Message = { id: `u-${Date.now()}`, sender: 'user', text: trimmed, ts: Date.now() };
    // Each user message consumes one free message (no-op for premium users).
    incrementFreeMessages();

    // Analytics + review trigger. Count this user's messages so far (the prior
    // turns plus this one) to drive both the message_sent number and the
    // engagement-peak review prompt.
    const userMsgNumber = messages.filter((m) => m.sender === 'user').length + 1;
    userMsgCountRef.current = userMsgNumber;
    logMessageSent(name, trimmed.length, character?.id, character?.categories?.[0]);
    // Engagement-depth milestones (drive the engagement funnel + event volume).
    if ([1, 5, 10, 25, 50].includes(userMsgNumber)) {
      logMessageMilestone(userMsgNumber, character?.id);
    }
    if (userMsgNumber >= REVIEW_AT_MESSAGE && !reviewAskedRef.current) {
      reviewAskedRef.current = true;
      showIfEligible();
    }
    // Snapshot history (story + prior turns) to send as context.
    const history: ChatTurn[] = messages.map((m) => ({ sender: m.sender, text: m.text }));
    history.push({ sender: 'user', text: trimmed });

    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setSending(true);
    setIsTyping(true);

    try {
      const reply = character
        ? await generateReply(trimmed, character, history, userName, i18n.language)
        : "I'm here with you. 💕";
      const aiMsg: Message = { id: `a-${Date.now()}`, sender: 'ai', text: reply, ts: Date.now() };
      const finalMsgs = [...messages, userMsg, aiMsg];
      setMessages(finalMsgs);
      persist(finalMsgs);
      // Arm/refresh the re-engagement cycle now (foreground = reliable).
      armReengagement(finalMsgs.filter((m) => m.sender === 'user').map((m) => m.text));

      // Conversion hook: after the user's Nth message, "she" calls — landing
      // non-premium users on the paywall. Premium users already have access, so
      // we skip them. Fires once, after her reply so it feels natural.
      if (
        !isPremium &&
        userMsgNumber >= AUTO_CALL_AT_MESSAGE &&
        !autoCallFiredRef.current
      ) {
        autoCallFiredRef.current = true;
        setTimeout(() => {
          navigation.navigate('IncomingCall', {
            character: character ?? undefined,
            auto: true,
          });
        }, 1200);
      }
    } finally {
      setIsTyping(false);
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        // SDK 54 forces Android edge-to-edge, where windowSoftInputMode=adjustResize
        // is a no-op — so the keyboard would draw over the composer. Avoiding on
        // BOTH platforms lifts the input + send button above the keyboard so the
        // user can type and send without dismissing it (WhatsApp-style).
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* Message canvas */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.canvas,
            { paddingTop: insets.top + 64 + 24, paddingBottom: 24 },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.timestampRow}>
            <View style={styles.timestampPill}>
              <Text style={styles.timestampText}>{strings.today}, {timestamp}</Text>
            </View>
          </View>

          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.row, m.sender === 'user' ? styles.rowEnd : styles.rowStart]}
            >
              {m.sender === 'ai' ? (
                <View style={[styles.bubble, styles.aiBubble]}>
                  <Text style={styles.aiText}>{m.text}</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={['#ff2a5f', '#e01e50']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.4, y: 1 }}
                  style={[styles.bubble, styles.userBubble]}
                >
                  <Text style={styles.userText}>{m.text}</Text>
                </LinearGradient>
              )}
            </View>
          ))}

          {isTyping && (
            <View style={[styles.row, styles.rowStart]}>
              <TypingIndicator />
            </View>
          )}
        </ScrollView>

        {/* Bottom composer */}
        <View style={styles.composerWrap}>
          {reachedLimit ? (
            <>
              {/* Paywall banner */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={openPaywall}
                style={styles.limitBanner}
              >
                <Ionicons name="lock-closed" size={18} color="#f5c451" />
                <View style={styles.limitBannerText}>
                  <Text style={styles.limitTitle}>
                    {interpolate(strings.limitTitle, { n: FREE_MESSAGE_LIMIT })}
                  </Text>
                  <Text style={styles.limitSubtitle}>
                    {interpolate(strings.limitSubtitle, { name })}
                  </Text>
                </View>
                <Text style={styles.limitUnlock}>{strings.unlock} →</Text>
              </TouchableOpacity>

              {/* Locked composer */}
              <View style={[styles.inputRow, { paddingBottom: kbOpen ? 12 : insets.bottom + 12 }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={openPaywall}
                  style={[styles.inputField, styles.inputFieldLocked]}
                >
                  <Text style={styles.lockedPlaceholder}>{strings.upgradeToContinue}</Text>
                  <View style={styles.lockBtn}>
                    <Ionicons name="lock-closed" size={16} color="#f5c451" />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {strings.suggestedReplies.map((reply) => (
                  <TouchableOpacity
                    key={reply}
                    activeOpacity={0.8}
                    style={styles.chip}
                    onPress={() => send(reply)}
                  >
                    <Text style={styles.chipText}>{reply}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={[styles.inputRow, { paddingBottom: kbOpen ? 12 : insets.bottom + 12 }]}>
                <TouchableOpacity style={styles.plusBtn} activeOpacity={0.8}>
                  <Ionicons name="add" size={22} color="#a0a0a5" />
                </TouchableOpacity>

                <View style={styles.inputField}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder={interpolate(strings.messagePlaceholder, { name })}
                    placeholderTextColor="#5a5a65"
                    style={styles.input}
                    selectionColor="#ff5070"
                    multiline
                    onSubmitEditing={() => send(draft)}
                  />
                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={!draft.trim() || sending}
                    onPress={() => send(draft)}
                    style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
                  >
                    <Ionicons name="send" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Top app bar (overlay) */}
      <BlurView intensity={24} tint="dark" style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#ffb2b9" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatarRing}>
            {character ? (
              <Image source={characterImageSource(character)} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]} />
            )}
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerStatus}>{strings.online}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {reachedLimit && (
            <TouchableOpacity style={styles.limitChip} activeOpacity={0.85} onPress={openPaywall}>
              <Ionicons name="lock-closed" size={12} color="#ff5070" />
              <Text style={styles.limitChipText}>{strings.limit}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.iconBtn, styles.callBtn]}
            activeOpacity={0.8}
            onPress={openCall}
          >
            <Ionicons name="call" size={18} color="#ffb2b9" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => setMenuOpen(true)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#ffb2b9" />
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* 3-dot menu */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuCard, { top: insets.top + 52 }]}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={handleUpgrade}>
              <Ionicons name="star" size={18} color="#f5c451" />
              <Text style={styles.menuText}>{strings.menuUpgrade}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={handleReport}>
              <Ionicons name="flag-outline" size={18} color="#e5e1e4" />
              <Text style={styles.menuText}>{strings.menuReport}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="#ff5070" />
              <Text style={[styles.menuText, { color: '#ff5070' }]}>{strings.menuDelete}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {promptElement}
      {reopenPromptElement}
    </View>
  );
};

const BUBBLE_RADIUS = 16;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131315' },
  flex: { flex: 1 },
  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: undefined,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(19,19,21,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#353437',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 9999,
  },
  callBtn: {
    backgroundColor: '#1a1a22',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // 3-dot menu
  menuBackdrop: {
    flex: 1,
  },
  menuCard: {
    position: 'absolute',
    right: 12,
    minWidth: 210,
    backgroundColor: '#1a1a22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#353437',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#e5e1e4',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#2a2a2c',
    marginHorizontal: 8,
  },
  limitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,80,112,0.5)',
    backgroundColor: 'rgba(255,80,112,0.08)',
  },
  limitChipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#ff5070',
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2a2a2c',
    padding: 2,
  },
  avatar: {
    flex: 1,
    borderRadius: 18,
  },
  avatarFallback: {
    backgroundColor: '#353437',
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00e475',
    borderWidth: 2,
    borderColor: '#131315',
  },
  headerName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 20,
    letterSpacing: -0.5,
    color: '#e5e1e4',
  },
  headerStatus: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16.8,
    color: '#a0a0a5',
  },
  // Canvas
  canvas: {
    paddingHorizontal: 20,
    gap: 24,
  },
  timestampRow: {
    alignItems: 'center',
  },
  timestampPill: {
    backgroundColor: '#353437',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  timestampText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16.8,
    color: '#5a5a65',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
  },
  rowStart: { justifyContent: 'flex-start' },
  rowEnd: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    padding: 16,
    borderRadius: BUBBLE_RADIUS,
  },
  aiBubble: {
    backgroundColor: '#1a1a22',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    borderTopRightRadius: 4,
    shadowColor: '#e01e50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  aiText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#e5e1e4',
  },
  userText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingVertical: 8,
    opacity: 0.7,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#a0a0a5',
  },
  // Composer
  composerWrap: {
    backgroundColor: 'rgba(19,19,21,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#353437',
    paddingTop: 9,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 9,
  },
  chip: {
    backgroundColor: '#1a1a22',
    borderWidth: 1,
    borderColor: '#353437',
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 9999,
  },
  chipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#e5e1e4',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  plusBtn: {
    padding: 8,
    marginBottom: 4,
  },
  inputField: {
    flex: 1,
    minHeight: 48,
    maxHeight: 128,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a22',
    borderWidth: 1,
    borderColor: '#353437',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#e5e1e4',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: 110,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e01e50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e01e50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  sendBtnDisabled: {
    backgroundColor: '#353437',
    shadowOpacity: 0,
  },
  // Paywall banner + locked composer
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(245,196,81,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,196,81,0.25)',
  },
  limitBannerText: {
    flex: 1,
  },
  limitTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#f5c451',
  },
  limitSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#a0a0a5',
    marginTop: 2,
  },
  limitUnlock: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#f5c451',
  },
  inputFieldLocked: {
    justifyContent: 'space-between',
    borderColor: 'rgba(245,196,81,0.4)',
    paddingLeft: 16,
  },
  lockedPlaceholder: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#8a7a4a',
  },
  lockBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,196,81,0.12)',
  },
});
