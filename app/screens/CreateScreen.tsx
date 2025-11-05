import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { RootStackParamList } from '../navigation/types';
import { ALL_VIDEOS } from '../utils/videoSelector';

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
