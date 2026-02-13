import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallStore } from '../store/callStore';
import { useGirlfriendStore } from '../store/girlfriendStore';
import { usePaymentStore } from '../store/paymentStore';

type IncomingCallScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'IncomingCall'
>;

type IncomingCallScreenRouteProp = RouteProp<RootStackParamList, 'IncomingCall'>;

interface IncomingCallScreenProps {
  navigation: IncomingCallScreenNavigationProp;
  route: IncomingCallScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  navigation,
  route,
}) => {
  const { characterName, characterImageUrl } = route.params;
  const { setHasSeenCall, setLastDeclinedTime } = useCallStore();
  const { girlfriends } = useGirlfriendStore();
  const { isPremium } = usePaymentStore();

  // Get a random girlfriend image from Firebase (or use provided one)
  const getRandomGirlfriendImage = () => {
    if (characterImageUrl) return characterImageUrl;

    // Filter girlfriends that have images
    const girlfriendsWithImages = girlfriends.filter(gf => gf.imageUrl);

    if (girlfriendsWithImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * girlfriendsWithImages.length);
      return girlfriendsWithImages[randomIndex].imageUrl;
    }

    return null;
  };

  const displayImage = getRandomGirlfriendImage();

  // Pulsing animation for avatar
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start vibration pattern (vibrate 1s, pause 0.5s, repeat)
    Vibration.vibrate([0, 1000, 500, 1000, 500, 1000], true);

    // Pulsing animation for avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Cleanup: Stop vibration on unmount
    return () => {
      Vibration.cancel();
    };
  }, []);

  const handlePickUp = () => {
    Vibration.cancel();
    setHasSeenCall(true);

    // Check if user is premium
    if (isPremium) {
      // Premium users can call directly
      const girlfriend = girlfriends.find(gf => gf.name === characterName);

      if (girlfriend) {
        navigation.navigate('VoiceCall', {
          characterName: girlfriend.name,
          characterImageUrl: girlfriend.imageUrl || characterImageUrl,
          characterId: girlfriend.id,
          characterProfile: {
            name: girlfriend.name,
            personality: girlfriend.personality,
            tone: girlfriend.tone,
            interests: girlfriend.interests,
            appearance: girlfriend.appearance,
          },
        });
      }
    } else {
      // Non-premium users see paywall
      navigation.replace('Paywall', {
        characterName,
        characterImageUrl,
        callAction: 'pick', // User wants to start call
        returnScreen: 'Chat', // Where to go after cancel
      });
    }
  };

  const handleDecline = () => {
    Vibration.cancel();
    setHasSeenCall(true);
    setLastDeclinedTime(Date.now()); // Track when user declined

    // Show paywall even on decline
    navigation.replace('Paywall', {
      characterName,
      characterImageUrl,
      callAction: 'decline', // User declined but see paywall anyway
      returnScreen: 'Chat',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0a0a0a', '#1a0a1a', '#0a0a1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Section - Call Type */}
      <View style={styles.topSection}>
        <View style={styles.callTypeContainer}>
          <Text style={styles.callTypeIcon}>📞</Text>
          <Text style={styles.callType}>Voice Call</Text>
        </View>
      </View>

      {/* Middle Section - Avatar & Name */}
      <View style={styles.middleSection}>
        {/* Multiple Glow Rings */}
        <View style={styles.avatarContainer}>
          <Animated.View
            style={[
              styles.glowRing,
              styles.glowRing1,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                }),
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [1, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowRing,
              styles.glowRing2,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0.3],
                }),
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [1.1, 1.25],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Avatar */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="memory-disk"
                priority="high"
                placeholder={require('../../assets/icon.png')}
                placeholderContentFit="contain"
                transition={200}
              />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Text style={styles.placeholderText}>
                  {characterName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Character Name */}
        <Text style={styles.characterName}>{characterName}</Text>
        <Text style={styles.subtitle}>Incoming voice call...</Text>

        {/* Call Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureBadge}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Private</Text>
          </View>
          <View style={styles.featureBadge}>
            <Text style={styles.featureIcon}>🎙️</Text>
            <Text style={styles.featureText}>HD Audio</Text>
          </View>
        </View>
      </View>

      {/* Bottom Section - Action Buttons */}
      <View style={styles.bottomSection}>
        {/* Decline Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDecline}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonIcon}>✕</Text>
          </LinearGradient>
          <Text style={styles.buttonLabel}>Decline</Text>
        </TouchableOpacity>

        {/* Pick Up Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePickUp}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonIcon}>📞</Text>
          </LinearGradient>
          <Text style={styles.buttonLabel}>Accept</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topSection: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  callTypeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  callType: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 100,
  },
  glowRing1: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  glowRing2: {
    width: 220,
    height: 220,
    borderWidth: 1.5,
    borderColor: '#C084FC',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#1a1a1a',
  },
  placeholderAvatar: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  characterName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  buttonGradient: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonIcon: {
    fontSize: 32,
  },
  buttonLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
