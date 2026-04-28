// Video sources
export const VIDEO_SOURCES = {
  DEFAULT: require('../../assets/videos/default.mp4'),
  ROMANTIC: require('../../assets/videos/romantic.mp4'),
  ANIME: require('../../assets/videos/anime.mp4'),
  FANTASY: require('../../assets/videos/fantasy.mp4'),
  MINIMAL: require('../../assets/videos/minimal.mp4'),
};

export const ALL_VIDEOS = [
  VIDEO_SOURCES.DEFAULT,
  VIDEO_SOURCES.ROMANTIC,
  VIDEO_SOURCES.ANIME,
  VIDEO_SOURCES.FANTASY,
  VIDEO_SOURCES.MINIMAL,
];

/**
 * Get video based on tone selection
 */
export const getVideoForTone = (tone: string): any => {
  const lowerTone = tone.toLowerCase();

  switch (lowerTone) {
    case 'cute':
    case 'cheerful':
      return VIDEO_SOURCES.ANIME;
    case 'caring':
    case 'supportive':
      return VIDEO_SOURCES.ROMANTIC;
    case 'mysterious':
      return VIDEO_SOURCES.FANTASY;
    case 'confident':
    case 'energetic':
      return VIDEO_SOURCES.DEFAULT;
    case 'friendly':
      return VIDEO_SOURCES.MINIMAL;
    default:
      return VIDEO_SOURCES.FANTASY;
  }
};

/**
 * Get video based on personality selection
 */
export const getVideoForPersonality = (personality: string): any => {
  const lowerPersonality = personality.toLowerCase();

  switch (lowerPersonality) {
    case 'kind':
    case 'empathetic':
    case 'supportive':
    case 'thoughtful':
      return VIDEO_SOURCES.MINIMAL;
    case 'adventurous':
    case 'bold':
    case 'spontaneous':
      return VIDEO_SOURCES.FANTASY;
    case 'intelligent':
    case 'creative':
      return VIDEO_SOURCES.DEFAULT;
    case 'funny':
      return VIDEO_SOURCES.ANIME;
    default:
      return VIDEO_SOURCES.ROMANTIC;
  }
};

/**
 * Get video based on interest selection
 */
export const getVideoForInterest = (interest: string): any => {
  const lowerInterest = interest.toLowerCase();

  switch (lowerInterest) {
    case 'music':
    case 'art':
      return VIDEO_SOURCES.ROMANTIC;
    case 'gaming':
    case 'technology':
      return VIDEO_SOURCES.ANIME;
    case 'movies':
    case 'travel':
      return VIDEO_SOURCES.FANTASY;
    case 'reading':
    case 'photography':
      return VIDEO_SOURCES.MINIMAL;
    case 'cooking':
    case 'sports':
    case 'fitness':
    case 'fashion':
      return VIDEO_SOURCES.DEFAULT;
    default:
      return VIDEO_SOURCES.FANTASY;
  }
};

/**
 * Get video based on appearance selection
 */
export const getVideoForAppearance = (appearance: string): any => {
  const lowerAppearance = appearance.toLowerCase();

  switch (lowerAppearance) {
    case 'anime':
      return VIDEO_SOURCES.ANIME;
    case 'fantasy':
      return VIDEO_SOURCES.FANTASY;
    case 'minimal':
      return VIDEO_SOURCES.MINIMAL;
    case 'realistic':
      return VIDEO_SOURCES.DEFAULT;
    default:
      return VIDEO_SOURCES.DEFAULT;
  }
};

/**
 * Get random video
 */
export const getRandomVideo = (): any => {
  return ALL_VIDEOS[Math.floor(Math.random() * ALL_VIDEOS.length)];
};
