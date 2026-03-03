import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Single high-quality background image from Firebase Storage
const BACKGROUND_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fceleste.jpg?alt=media&token=eef9d2fb-b690-4e8b-aba9-718e2e66e526';

/**
 * Onboarding background component with full-screen image and gradient overlay
 * Replaces the old floating card images for better readability
 */
export const CharacterImageOverlay: React.FC = () => {
  return (
    <>
      {/* Full-screen background image */}
      <ImageBackground
        source={{ uri: BACKGROUND_IMAGE }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark gradient overlay for text readability */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.75)',  // Darker at top
            'rgba(26, 9, 51, 0.6)', // App theme color in middle
            'rgba(0, 0, 0, 0.85)',  // Darkest at bottom for text
          ]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
