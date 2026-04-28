// Background video mapping
// These videos should be added to assets/videos/ directory

export const backgroundMap = {
  default: require('../../assets/videos/default.mp4'),
  cute: require('../../assets/videos/default.mp4'),
  friendly: require('../../assets/videos/default.mp4'),
  cheerful: require('../../assets/videos/default.mp4'),
  caring: require('../../assets/videos/default.mp4'),
  supportive: require('../../assets/videos/default.mp4'),
  mysterious: require('../../assets/videos/default.mp4'),
  confident: require('../../assets/videos/default.mp4'),
  energetic: require('../../assets/videos/default.mp4'),
};

export const getBackgroundForProfile = (
  tone?: string[],
  mode?: string
): any => {
  // Default background
  let background = backgroundMap.default;

  // Select background based on primary tone
  if (tone && tone.length > 0) {
    const primaryTone = tone[0].toLowerCase();
    if (primaryTone in backgroundMap) {
      background = backgroundMap[primaryTone as keyof typeof backgroundMap];
    }
  }

  // Mode is already sanitized, no need for mode-specific override

  return background;
};
