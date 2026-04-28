import { useState, useEffect } from 'react';
import { useUserProfile } from '../store/userProfile';

// Local video sources
const VIDEO_SOURCES = {
  DEFAULT: require('../../assets/videos/default.mp4'),
  ROMANTIC: require('../../assets/videos/romantic.mp4'),
  ANIME: require('../../assets/videos/anime.mp4'),
  FANTASY: require('../../assets/videos/fantasy.mp4'),
  MINIMAL: require('../../assets/videos/minimal.mp4'),
};

/**
 * Hook to get appropriate video source based on user profile
 * Returns the local video source that matches user's selections
 */
export const useVideoForProfile = () => {
  const { profile } = useUserProfile();
  const [videoSource, setVideoSource] = useState(VIDEO_SOURCES.FANTASY);

  useEffect(() => {
    // Determine video based on appearance or interests
    let newVideoSource = VIDEO_SOURCES.FANTASY; // Default

    // Priority 1: Appearance selection
    if (profile.appearance) {
      switch (profile.appearance.toLowerCase()) {
        case 'anime':
          newVideoSource = VIDEO_SOURCES.ANIME;
          break;
        case 'fantasy':
          newVideoSource = VIDEO_SOURCES.FANTASY;
          break;
        case 'minimal':
          newVideoSource = VIDEO_SOURCES.MINIMAL;
          break;
        case 'realistic':
          newVideoSource = VIDEO_SOURCES.DEFAULT;
          break;
        default:
          newVideoSource = VIDEO_SOURCES.DEFAULT;
      }
    }
    // Priority 2: Tone selection (if no appearance yet)
    else if (profile.tone && profile.tone.length > 0) {
      const primaryTone = profile.tone[0].toLowerCase();
      if (primaryTone === 'caring' || primaryTone === 'supportive') {
        newVideoSource = VIDEO_SOURCES.ROMANTIC;
      } else if (primaryTone === 'mysterious') {
        newVideoSource = VIDEO_SOURCES.FANTASY;
      } else if (primaryTone === 'cute' || primaryTone === 'cheerful') {
        newVideoSource = VIDEO_SOURCES.ANIME;
      }
    }
    // Priority 3: Interests (if no appearance or tone)
    else if (profile.interests && profile.interests.length > 0) {
      const primaryInterest = profile.interests[0].toLowerCase();
      if (primaryInterest === 'art' || primaryInterest === 'music') {
        newVideoSource = VIDEO_SOURCES.ANIME;
      } else if (primaryInterest === 'movies' || primaryInterest === 'gaming') {
        newVideoSource = VIDEO_SOURCES.FANTASY;
      } else if (primaryInterest === 'reading' || primaryInterest === 'photography') {
        newVideoSource = VIDEO_SOURCES.MINIMAL;
      }
    }

    setVideoSource(newVideoSource);
  }, [profile.appearance, profile.tone, profile.interests]);

  return videoSource;
};
