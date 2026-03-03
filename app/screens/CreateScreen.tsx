import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CharacterImageOverlay } from '../components/CharacterImageOverlay';
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

  return (
    <View style={styles.container}>
      <CharacterImageOverlay />

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
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleAccent: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FF3263',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
});
