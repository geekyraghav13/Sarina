import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useGirlfriendStore, Girlfriend } from '../store/girlfriendStore';
import { VideoBackground } from '../components/VideoBackground';
import { logScreenView } from '../services/analyticsService';

type ConversationsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Chat'
>;

interface ConversationsScreenProps {}

export const ConversationsScreen: React.FC<ConversationsScreenProps> = () => {
  const navigation = useNavigation<ConversationsScreenNavigationProp>();
  const {
    girlfriends,
    setSelectedGirlfriend,
    chatHistories,
    deleteConversation,
    clearAllChats,
  } = useGirlfriendStore();
  const [swipeableRefs, setSwipeableRefs] = useState<Record<string, Swipeable | null>>({});

  // Filter girlfriends who have chat history
  const girlfriendsWithChats = girlfriends.filter(
    (gf) => chatHistories[gf.id] && chatHistories[gf.id].length > 0
  );

  // Track screen view
  React.useEffect(() => {
    logScreenView('Conversations', {
      conversation_count: girlfriendsWithChats.length,
    });
  }, [girlfriendsWithChats.length]);

  const handleConversationPress = useCallback((girlfriend: Girlfriend) => {
    // Set the selected girlfriend first
    setSelectedGirlfriend(girlfriend);

    // Use setTimeout to navigate after state update completes
    setTimeout(() => {
      navigation.navigate('Chat', { fromOnboarding: false });
    }, 0);
  }, [setSelectedGirlfriend, navigation]);

  const getLastMessage = (girlfriendId: string): string => {
    const messages = chatHistories[girlfriendId];
    if (!messages || messages.length === 0) return 'No messages yet';
    const lastMsg = messages[messages.length - 1];
    return lastMsg.text.length > 50
      ? lastMsg.text.substring(0, 50) + '...'
      : lastMsg.text;
  };

  const getLastMessageTime = (girlfriendId: string): string => {
    const messages = chatHistories[girlfriendId];
    if (!messages || messages.length === 0) return '';
    const lastMsg = messages[messages.length - 1];
    const now = new Date();
    const msgTime = new Date(lastMsg.timestamp);
    const diffMs = now.getTime() - msgTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleDeleteConversation = useCallback((girlfriend: Girlfriend) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete your conversation with ${girlfriend.name}? This cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Close the swipeable
            swipeableRefs[girlfriend.id]?.close();
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteConversation(girlfriend.id);
          },
        },
      ]
    );
  }, [deleteConversation, swipeableRefs]);

  const handleClearAllChats = useCallback(() => {
    if (girlfriendsWithChats.length === 0) return;

    Alert.alert(
      'Clear All Conversations',
      `Are you sure you want to delete all ${girlfriendsWithChats.length} conversations? This cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearAllChats();
          },
        },
      ]
    );
  }, [girlfriendsWithChats.length, clearAllChats]);

  const renderRightActions = useCallback((
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    girlfriend: Girlfriend
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View
          style={[
            styles.deleteButton,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButtonTouchable}
            onPress={() => handleDeleteConversation(girlfriend)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }, [handleDeleteConversation]);

  const renderConversationItem = (girlfriend: Girlfriend) => (
    <Swipeable
      key={girlfriend.id}
      ref={(ref) => {
        if (ref && !swipeableRefs[girlfriend.id]) {
          setSwipeableRefs((prev) => ({ ...prev, [girlfriend.id]: ref }));
        }
      }}
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, girlfriend)
      }
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(girlfriend)}
        activeOpacity={0.7}
      >
        {/* Avatar with video preview */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {girlfriend.videoPath ? (
              <VideoBackground source={girlfriend.videoPath} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {girlfriend.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.onlineIndicator} />
        </View>

        {/* Conversation Info */}
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.girlfriendName}>{girlfriend.name}</Text>
            <Text style={styles.timeText}>{getLastMessageTime(girlfriend.id)}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {getLastMessage(girlfriend.id)}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {girlfriendsWithChats.length} conversation{girlfriendsWithChats.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {girlfriendsWithChats.length > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearAllChats}
              activeOpacity={0.7}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.conversationsContainer}
        showsVerticalScrollIndicator={false}
      >
        {girlfriendsWithChats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💬</Text>
            <Text style={styles.emptyStateText}>No conversations yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start chatting with a girlfriend from the Home tab
            </Text>
          </View>
        ) : (
          girlfriendsWithChats.map((girlfriend) =>
            renderConversationItem(girlfriend)
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  clearAllButton: {
    backgroundColor: 'rgba(255, 50, 99, 0.2)',
    borderWidth: 1.5,
    borderColor: '#FF3263',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF3263',
  },
  scrollView: {
    flex: 1,
  },
  conversationsContainer: {
    padding: 16,
    paddingBottom: 100, // Space for bottom nav
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF3263',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 50, 99, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#000000',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  girlfriendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  lastMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  swipeActionsContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3263',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    borderRadius: 16,
  },
  deleteButtonTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  deleteIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
