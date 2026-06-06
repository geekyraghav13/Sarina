/**
 * Settings (Figma node 39:732).
 *
 * Premium banner (→ RevenueCat paywall), Account / Preferences / Support
 * sections, and Logout. Shares the bottom nav (Settings active). Native bits
 * (RevenueCat, Google Sign-In) are lazy-required so the screen stays
 * Expo-Go-safe; Firebase JS sign-out is fine in Expo Go.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView } from '../../services/firebaseAnalytics';
import {
  useSettingsStrings,
  useDeleteAccountStrings,
  useSettingsExtraStrings,
} from '../../data/onboardingStrings';
import { usePaymentStore } from '../../store/paymentStore';
import { presentPaywall } from '../../services/paywall';
import { updateAppOpen } from '../../services/userEngagementService';
import { auth } from '../../config/firebase';
import { BottomNav } from './BottomNav';

const APP_VERSION = 'v2.9.25';
const PRIVACY_URL = 'https://sarina-ai-companion.lovable.app/privacy';
const TERMS_URL = 'https://sarina-ai-companion.lovable.app/terms';
const SUPPORT_EMAIL = 'helpjalpat@gmail.com';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.x8284.katrina';

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Settings'>;
};

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const s = useSettingsStrings();
  const d = useDeleteAccountStrings();
  const x = useSettingsExtraStrings();
  const [busy, setBusy] = React.useState(false);
  const isPremium = usePaymentStore((st) => st.isPremium);
  const setIsPremium = usePaymentStore((st) => st.setIsPremium);
  const loadSubscriptionStatus = usePaymentStore((st) => st.loadSubscriptionStatus);

  React.useEffect(() => {
    logScreenView('Settings');
    loadSubscriptionStatus();
    (async () => {
      try {
        const premium = await require('../../services/revenueCatService').checkPremiumStatus();
        await setIsPremium(!!premium);
      } catch {}
    })();
  }, []);

  const openPaywall = async () => {
    const r = await presentPaywall();
    if (r === null) {
      Alert.alert(s.comingSoon, '');
      return;
    }
    await setIsPremium(r);
  };

  const openLink = (url: string) =>
    Linking.openURL(url).catch(() => Alert.alert(s.comingSoon, ''));

  // Request push-notification permission (native module → lazy-required).
  const requestPush = async () => {
    try {
      const token = await require('../../services/notificationService').registerForPushNotifications();
      updateAppOpen(token);
      Alert.alert('', token ? x.notifEnabled : x.notifDisabled);
    } catch {
      Alert.alert('', x.notifDisabled);
    }
  };

  const shareApp = () => {
    Share.share({ message: `${x.shareMessage} ${PLAY_URL}` }).catch(() => {});
  };

  const rateUs = () => {
    Linking.openURL(`market://details?id=com.x8284.katrina`).catch(() =>
      Linking.openURL(PLAY_URL).catch(() => {})
    );
  };

  const reportProblem = () => {
    const subject = encodeURIComponent('Sarina — Report a Problem');
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`).catch(() =>
      Alert.alert(x.reportProblem, SUPPORT_EMAIL)
    );
  };

  const doLogout = async () => {
    try { await firebaseSignOut(auth); } catch {}
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut();
    } catch {}
    try { await require('../../services/revenueCatService').logoutRevenueCatUser(); } catch {}
    try { usePaymentStore.getState().resetStore(); } catch {}
    try { await AsyncStorage.clear(); } catch {}
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const confirmLogout = () => {
    Alert.alert(s.logout, s.logoutConfirm, [
      { text: s.cancel, style: 'cancel' },
      { text: s.logout, style: 'destructive', onPress: doLogout },
    ]);
  };

  const doDeleteAccount = async () => {
    setBusy(true);
    try {
      // Full teardown: Firestore data + RevenueCat + Google revoke + Firebase
      // Auth account + AsyncStorage. Native → lazy-required.
      await require('../../services/authService').deleteAccount();
      try { usePaymentStore.getState().resetStore(); } catch {}
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (e: any) {
      setBusy(false);
      Alert.alert(d.deleteAccount, d.deleteFailed);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(d.deleteAccount, d.deleteConfirm, [
      { text: s.cancel, style: 'cancel' },
      { text: d.delete, style: 'destructive', onPress: doDeleteAccount },
    ]);
  };

  const Row = ({
    icon,
    label,
    right,
    onPress,
    first,
    danger,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    right?: string;
    onPress?: () => void;
    first?: boolean;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.row, !first && styles.rowDivider]}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={danger ? '#e01e50' : '#e5e1e4'} />
        <Text style={[styles.rowLabel, danger && { color: '#e01e50' }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {right ? <Text style={styles.rowValue}>{right}</Text> : null}
        {!danger && <Ionicons name="chevron-forward" size={16} color="#5a5a65" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 64 + 16, paddingBottom: insets.bottom + 110 },
        ]}
      >
        <View style={styles.heading}>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.subtitle}>{s.subtitle}</Text>
        </View>

        {/* Premium banner */}
        <View style={styles.premium}>
          <View style={styles.premiumRow}>
            <View style={styles.premiumIcon}>
              <Ionicons name="star" size={18} color="#ffb2b9" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.premiumTitle}>
                {isPremium ? s.premiumPlan : s.premiumTitle}
              </Text>
              <Text style={styles.premiumSubtitle}>
                {isPremium ? s.premiumActive : s.premiumSubtitle}
              </Text>
            </View>
          </View>
          {!isPremium && (
            <TouchableOpacity activeOpacity={0.85} onPress={openPaywall} style={styles.upgradeWrap}>
              <LinearGradient
                colors={['#e01e50', '#ff5070']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeBtn}
              >
                <Text style={styles.upgradeText}>{s.upgradeNow}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick actions */}
        <View style={styles.card}>
          <Row icon="share-social-outline" label={x.shareApp} onPress={shareApp} first />
          <Row icon="star-outline" label={x.rateUs} onPress={rateUs} />
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.account}</Text>
          <View style={styles.card}>
            <Row
              icon="card-outline"
              label={s.subscription}
              right={isPremium ? s.premiumPlan : s.freePlan}
              onPress={openPaywall}
              first
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.preferences}</Text>
          <View style={styles.card}>
            <Row icon="notifications-outline" label={s.notifications} onPress={requestPush} first />
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.privacy}</Text>
          <View style={styles.card}>
            <Row icon="mail-outline" label={x.reportProblem} onPress={reportProblem} first />
            <Row icon="trash-outline" label={d.deleteAccount} onPress={confirmDeleteAccount} danger />
          </View>
        </View>

        {/* Legal / About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.support}</Text>
          <View style={styles.card}>
            <Row icon="document-text-outline" label={x.terms} onPress={() => openLink(TERMS_URL)} first />
            <Row icon="shield-checkmark-outline" label={x.privacyPolicy} onPress={() => openLink(PRIVACY_URL)} />
            <Row icon="information-circle-outline" label={s.about} right={APP_VERSION} />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logout} activeOpacity={0.8} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={18} color="#e01e50" />
          <Text style={styles.logoutText}>{s.logout}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Top app bar (brand) */}
      <LinearGradient
        colors={['#15151a', 'rgba(21,21,26,0)']}
        style={[styles.header, { height: insets.top + 64, paddingTop: insets.top }]}
      >
        <Text style={styles.brand}>Sarina</Text>
      </LinearGradient>

      <BottomNav
        active="settings"
        onDiscover={() => navigation.navigate('Discover')}
        onMessages={() => navigation.navigate('Home')}
      />

      {busy && (
        <View style={styles.overlay} pointerEvents="auto">
          <ActivityIndicator color="#ff5070" size="large" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131315' },
  scroll: { paddingHorizontal: 20, gap: 32 },
  flex1: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  brand: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    letterSpacing: -0.8,
    color: '#ffb2b9',
  },
  heading: { gap: 4 },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    lineHeight: 35,
    color: '#e5e1e4',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#a0a0a5',
  },
  // Premium banner
  premium: {
    gap: 16,
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a22',
    borderWidth: 1,
    borderColor: 'rgba(255,80,112,0.2)',
    shadowColor: '#e01e50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  premiumRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  premiumIcon: {
    width: 41,
    height: 41,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,80,112,0.2)',
  },
  premiumTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 27,
    color: '#ffb2b9',
  },
  premiumSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#a0a0a5',
    marginTop: 2,
  },
  upgradeWrap: { alignSelf: 'flex-start', borderRadius: 9999 },
  upgradeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  upgradeText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    letterSpacing: 0.2,
    color: '#e5e1e4',
  },
  // Sections
  section: { gap: 8 },
  sectionTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 27,
    color: '#e5e1e4',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#201f21',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(53,52,55,0.5)',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  rowLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#e5e1e4',
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#a0a0a5',
  },
  // Logout
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
  },
  logoutText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    letterSpacing: 0.2,
    color: '#e01e50',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
    marginTop: -16,
  },
  deleteText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#8a8a90',
    textDecorationLine: 'underline',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(19,19,21,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
