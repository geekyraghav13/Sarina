import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface VideoBackgroundProps {
  source?: any; // Kept for compatibility, but not used
  onLoad?: () => void;
  onVideoEnd?: () => void;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  source,
  onLoad,
  onVideoEnd,
}) => {
  // Use a static gradient background instead of video
  // Purple/pink gradient matching the app theme
  return (
    <LinearGradient
      colors={['#1a0933', '#2d1854', '#4a1d75']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
