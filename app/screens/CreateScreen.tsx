import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { RootStackParamList } from '../navigation/types';
import { ALL_VIDEOS } from '../utils/videoSelector';

// Character images for onboarding background
const CHARACTER_IMAGES = [
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fakira.jpg?alt=media&token=c46eda7f-d55f-4637-842e-f8538c26b54e',
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fceleste.jpg?alt=media&token=eef9d2fb-b690-4e8b-aba9-718e2e66e526',
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fbella.jpg?alt=media&token=5cba7b17-80e2-4c0f-b35c-859762f0ce73',
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fgrace.jpg?alt=media&token=530caf70-f951-455a-b185-e1c868206a4e',
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Firis.jpg?alt=media&token=0054b6ac-55f6-4914-8927-e940b5fde84d',
];

type CreateScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Create'
>;

interface CreateScreenProps {
  navigation: CreateScreenNavigationProp;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ navigation }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(
    Math.floor(Math.random() * ALL_VIDEOS.length)
  );

  // Change video every time it loops (when it ends)
  const handleVideoEnd = () => {
    // Pick a random video different from current one
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * ALL_VIDEOS.length);
    } while (newIndex === currentVideoIndex && ALL_VIDEOS.length > 1);
    setCurrentVideoIndex(newIndex);
  };

  const handleStart = () => {
    navigation.navigate('Age');
  };

  return (
    <View style={styles.container}>
      <VideoBackground
        source={ALL_VIDEOS[currentVideoIndex]}
        onVideoEnd={handleVideoEnd}
      />

      {/* Character Images Overlay - 5 images in grid */}
      <View style={styles.imagesOverlay} pointerEvents="none">
        <View style={styles.imageRow}>
          <Image
            source={{ uri: CHARACTER_IMAGES[0] }}
            style={styles.characterImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
          <Image
            source={{ uri: CHARACTER_IMAGES[1] }}
            style={styles.characterImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
        </View>
        <View style={styles.centerImageContainer}>
          <Image
            source={{ uri: CHARACTER_IMAGES[2] }}
            style={styles.centerImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
        </View>
        <View style={styles.imageRow}>
          <Image
            source={{ uri: CHARACTER_IMAGES[3] }}
            style={styles.characterImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
          <Image
            source={{ uri: CHARACTER_IMAGES[4] }}
            style={styles.characterImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.footer}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Your</Text>
            <Text style={styles.titleAccent}>AI Girlfriend</Text>
            <Text style={styles.subtitle}>
              Your perfect companion, personalized just for you
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 80,
    paddingBottom: 250,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  characterImage: {
    width: 90,
    height: 130,
    borderRadius: 16,
    opacity: 0.5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  centerImageContainer: {
    alignItems: 'center',
  },
  centerImage: {
    width: 100,
    height: 140,
    borderRadius: 18,
    opacity: 0.6,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 50, 99, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FF3263',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FF3263',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
});
