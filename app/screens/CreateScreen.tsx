import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { GlassContainer } from '../components/GlassContainer';
import { RootStackParamList } from '../navigation/types';

type CreateScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Create'
>;

interface CreateScreenProps {
  navigation: CreateScreenNavigationProp;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ navigation }) => {
  const handleStart = () => {
    navigation.navigate('Age');
  };

  const handleSurprise = () => {
    // TODO: Implement random profile generation
    navigation.navigate('Age');
  };

  return (
    <View style={styles.container}>
      <VideoBackground source={require('../../assets/videos/default.mp4')} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Your</Text>
          <Text style={styles.titleAccent}>AI Girlfriend</Text>
          <Text style={styles.subtitle}>
            Your perfect companion, personalized just for you
          </Text>
        </View>

        <View style={styles.footer}>
          <GlassContainer style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Start Creating</Text>
            </TouchableOpacity>
          </GlassContainer>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSurprise}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Surprise Me</Text>
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
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
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
  buttonContainer: {
    padding: 0,
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
