import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../config/firebase';

// Video paths in Firebase Storage
export const VIDEO_PATHS = {
  DEFAULT: 'videos/default.mp4',
  ROMANTIC: 'videos/romantic.mp4',
  ANIME: 'videos/anime.mp4',
  FANTASY: 'videos/fantasy.mp4',
  MINIMAL: 'videos/minimal.mp4',
} as const;

// Cache for video URLs to avoid multiple fetches
const videoUrlCache: Record<string, string> = {};

/**
 * Get video URL from Firebase Storage
 * @param videoPath - Path to video in Firebase Storage
 * @returns Promise with video URL
 */
export const getVideoUrl = async (videoPath: string): Promise<string> => {
  try {
    // Return cached URL if available
    if (videoUrlCache[videoPath]) {
      return videoUrlCache[videoPath];
    }

    // Get download URL from Firebase Storage
    const videoRef = ref(storage, videoPath);
    const url = await getDownloadURL(videoRef);

    // Cache the URL
    videoUrlCache[videoPath] = url;

    return url;
  } catch (error) {
    console.error('Error fetching video URL:', error);
    // Return local fallback video if Firebase fails
    throw error;
  }
};

/**
 * Preload video URLs for faster loading
 * @param videoPaths - Array of video paths to preload
 */
export const preloadVideoUrls = async (videoPaths: string[]): Promise<void> => {
  try {
    await Promise.all(
      videoPaths.map(path => getVideoUrl(path))
    );
    console.log('Videos preloaded successfully');
  } catch (error) {
    console.error('Error preloading videos:', error);
  }
};

/**
 * Get video URL based on appearance style
 * @param appearance - Appearance style selected by user
 * @returns Promise with video URL
 */
export const getVideoForAppearance = async (appearance?: string): Promise<string> => {
  let videoPath = VIDEO_PATHS.DEFAULT;

  switch (appearance?.toLowerCase()) {
    case 'anime':
      videoPath = VIDEO_PATHS.ANIME;
      break;
    case 'fantasy':
      videoPath = VIDEO_PATHS.FANTASY;
      break;
    case 'minimal':
      videoPath = VIDEO_PATHS.MINIMAL;
      break;
    case 'realistic':
    default:
      videoPath = VIDEO_PATHS.DEFAULT;
      break;
  }

  return getVideoUrl(videoPath);
};
