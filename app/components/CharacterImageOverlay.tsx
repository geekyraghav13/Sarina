import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

// Character images from Firebase Storage - Updated with new URLs
const CHARACTER_IMAGES = [
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fakira.jpg?alt=media&token=c46eda7f-d55f-4637-842e-f8538c26b54e',
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fceleste.jpg?alt=media&token=eef9d2fb-b690-4e8b-aba9-718e2e66e526',
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fbella.jpg?alt=media&token=5cba7b17-80e2-4c0f-b35c-859762f0ce73',
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fgrace.jpg?alt=media&token=530caf70-f951-455a-b185-e1c868206a4e',
];

export const CharacterImageOverlay: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.topRow}>
        <Image
          source={{ uri: CHARACTER_IMAGES[0] }}
          style={styles.characterImage}
          resizeMode="cover"
        />
        <Image
          source={{ uri: CHARACTER_IMAGES[1] }}
          style={styles.characterImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.bottomRow}>
        <Image
          source={{ uri: CHARACTER_IMAGES[2] }}
          style={styles.characterImage}
          resizeMode="cover"
        />
        <Image
          source={{ uri: CHARACTER_IMAGES[3] }}
          style={styles.characterImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 200,
  },
  characterImage: {
    width: 80,
    height: 120,
    borderRadius: 12,
    opacity: 0.6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
