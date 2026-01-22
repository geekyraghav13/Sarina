import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useGirlfriendStore, Girlfriend } from '../store/girlfriendStore';
import { VideoBackground } from '../components/VideoBackground';
import {
  logScreenView,
  logCharacterSelected,
  logHomeScreenViewed,
} from '../services/analyticsService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // 2 columns with padding (16*2 sides + 8 gap in middle)

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface HomeScreenProps {}

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    girlfriends,
    setSelectedGirlfriend,
    loadGirlfriends,
    retryLoadGirlfriends,
    loadChatHistoriesFromStorage,
    isLoading,
    error,
  } = useGirlfriendStore();

  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // Load girlfriends from Firebase and chat histories on mount
  useEffect(() => {
    loadGirlfriends();
    loadChatHistoriesFromStorage(); // Load saved chats from AsyncStorage
    logScreenView('Home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log when girlfriends are loaded
  useEffect(() => {
    if (girlfriends.length > 0 && !isLoading) {
      logHomeScreenViewed(girlfriends.length);
    }
  }, [girlfriends.length, isLoading]);

  const handleGirlfriendSelect = (girlfriend: Girlfriend) => {
    setSelectedGirlfriend(girlfriend);
    // Track character selection
    logCharacterSelected(girlfriend.id, girlfriend.name, girlfriend.appearance);
    navigation.navigate('Chat', { fromOnboarding: false });
  };

  const handleImageError = (girlfriendId: string) => {
    setImageLoadErrors((prev) => ({ ...prev, [girlfriendId]: true }));
    setImageLoadingStates((prev) => ({ ...prev, [girlfriendId]: false }));
  };

  const handleImageLoadStart = (girlfriendId: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [girlfriendId]: true }));
  };

  const handleImageLoadEnd = (girlfriendId: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [girlfriendId]: false }));
  };

  const renderGirlfriendCard = (girlfriend: Girlfriend, index: number) => {
    const hasImageUrl = girlfriend.imageUrl && !imageLoadErrors[girlfriend.id];
    const hasVideoPath = girlfriend.videoPath;
    const isImageLoading = imageLoadingStates[girlfriend.id];

    return (
      <TouchableOpacity
        key={`character-${girlfriend.id}-${index}`}
        style={styles.card}
        onPress={() => handleGirlfriendSelect(girlfriend)}
        activeOpacity={0.9}
      >
        {/* Image/Video Preview */}
        <View style={styles.cardVideo}>
          {hasImageUrl ? (
            <>
              <Image
                source={{ uri: girlfriend.imageUrl }}
                style={styles.cardImage}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
                onLoadStart={() => handleImageLoadStart(girlfriend.id)}
                onLoad={() => handleImageLoadEnd(girlfriend.id)}
                onError={() => handleImageError(girlfriend.id)}
                placeholder={require('../../assets/icon.png')}
                placeholderContentFit="contain"
              />
              {isImageLoading && (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator size="small" color="#FF3263" />
                </View>
              )}
              <View style={styles.cardOverlay} />
            </>
          ) : hasVideoPath ? (
            <>
              <VideoBackground source={girlfriend.videoPath} />
              <View style={styles.cardOverlay} />
            </>
          ) : (
            <>
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {girlfriend.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.cardOverlay} />
            </>
          )}
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{girlfriend.name}</Text>
          <Text style={styles.cardTagline}>{girlfriend.tagline}</Text>

          {/* Personality Tags */}
          <View style={styles.tagsContainer}>
            {girlfriend.personality.slice(0, 2).map((trait, traitIndex) => (
              <View key={`${girlfriend.id}-${trait}-${traitIndex}`} style={styles.tag}>
                <Text style={styles.tagText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3263" />
          <Text style={styles.loadingText}>Loading characters...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your</Text>
        <Text style={styles.headerTitleAccent}>AI Girlfriend</Text>
        <Text style={styles.headerSubtitle}>
          Select who you'd like to chat with
        </Text>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryLoadGirlfriends}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Girlfriend Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {girlfriends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No characters available</Text>
            <TouchableOpacity
              style={styles.retryButtonLarge}
              onPress={retryLoadGirlfriends}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          girlfriends.map((girlfriend, index) => renderGirlfriendCard(girlfriend, index))
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
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerTitleAccent: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF3263',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 100, // Space for bottom nav
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  cardVideo: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardTagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255, 50, 99, 0.2)',
    borderWidth: 1,
    borderColor: '#FF3263',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 50, 99, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorBanner: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 50, 99, 0.2)',
    borderWidth: 1,
    borderColor: '#FF3263',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 8,
  },
  retryButton: {
    backgroundColor: '#FF3263',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  retryButtonLarge: {
    backgroundColor: '#FF3263',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
