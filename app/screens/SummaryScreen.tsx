import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { GlassContainer } from '../components/GlassContainer';
import { useUserProfile } from '../store/userProfile';
import { RootStackParamList } from '../navigation/types';

type SummaryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Summary'
>;

interface SummaryScreenProps {
  navigation: SummaryScreenNavigationProp;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ navigation }) => {
  const { profile } = useUserProfile();

  const handleStart = () => {
    navigation.navigate('Chat');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <VideoBackground source={require('../../assets/videos/default.mp4')} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.step}>Step 8 of 8</Text>
          <Text style={styles.title}>Meet {profile.name || 'Your AI'}</Text>
          <Text style={styles.subtitle}>
            Review your creation before starting
          </Text>
        </View>

        <GlassContainer style={styles.summaryContainer}>
          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Name</Text>
            <Text style={styles.sectionValue}>{profile.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Age</Text>
            <Text style={styles.sectionValue}>{profile.age} years old</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Tone</Text>
            <Text style={styles.sectionValue}>
              {profile.tone?.join(', ') || 'Not set'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Personality</Text>
            <Text style={styles.sectionValue}>
              {profile.personality?.join(', ') || 'Not set'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Interests</Text>
            <Text style={styles.sectionValue}>
              {profile.interests?.join(', ') || 'Not set'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Appearance</Text>
            <Text style={styles.sectionValue}>
              {profile.appearance
                ? profile.appearance.charAt(0).toUpperCase() +
                  profile.appearance.slice(1)
                : 'Not set'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Mode</Text>
            <Text style={styles.sectionValue}>
              {profile.mode
                ? profile.mode.charAt(0).toUpperCase() + profile.mode.slice(1)
                : 'Not set'}
            </Text>
          </View>
        </GlassContainer>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <GlassContainer style={styles.startButtonContainer}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Start Chatting</Text>
              </TouchableOpacity>
            </GlassContainer>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  step: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  summaryContainer: {
    marginBottom: 32,
  },
  summarySection: {
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  footer: {
    marginTop: 'auto',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  startButtonContainer: {
    flex: 2,
    padding: 0,
  },
  startButton: {
    backgroundColor: '#FF3263',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
