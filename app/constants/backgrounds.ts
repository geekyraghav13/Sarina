// Background video mapping
// These videos should be added to assets/videos/ directory

export const backgroundMap = {
  default: require('../../assets/videos/default.mp4'),
  flirty: require('../../assets/videos/default.mp4'), // TODO: Add flirty.mp4
  cute: require('../../assets/videos/default.mp4'), // TODO: Add cute.mp4
  romantic: require('../../assets/videos/default.mp4'), // TODO: Add romantic.mp4
  playful: require('../../assets/videos/default.mp4'), // TODO: Add playful.mp4
  mysterious: require('../../assets/videos/default.mp4'), // TODO: Add mysterious.mp4
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

  // Override with mode-specific background if needed
  if (mode === 'romantic' && backgroundMap.romantic) {
    background = backgroundMap.romantic;
  }

  return background;
};
