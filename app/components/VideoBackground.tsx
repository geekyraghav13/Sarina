import React, { useRef, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface VideoBackgroundProps {
  source: any; // Local video source
  onLoad?: () => void;
  onVideoEnd?: () => void;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  source,
  onLoad,
  onVideoEnd,
}) => {
  const video = useRef<Video>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && !isLoaded) {
      setIsLoaded(true);
      onLoad?.();
    }

    // Call onVideoEnd when video finishes (just before it loops)
    if (status.isLoaded && status.didJustFinish && onVideoEnd) {
      onVideoEnd();
    }
  };

  // Return null if source is not provided to prevent crashes
  if (!source) {
    return null;
  }

  return (
    <Video
      ref={video}
      source={source}
      style={styles.video}
      resizeMode={ResizeMode.COVER}
      shouldPlay
      isLooping
      isMuted
      onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
    />
  );
};

const styles = StyleSheet.create({
  video: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
});
