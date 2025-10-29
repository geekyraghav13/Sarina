import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface VideoBackgroundProps {
  source: any;
  onLoad?: () => void;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  source,
  onLoad,
}) => {
  const video = useRef<Video>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [source]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && !isLoaded) {
      setIsLoaded(true);
      onLoad?.();
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  video: {
    width,
    height,
  },
});
