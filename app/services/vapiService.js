import Vapi from '@vapi-ai/react-native';

const VAPI_PUBLIC_KEY = "e24046c3-e0b4-4cb8-8896-3284dd8f4a6a";
const VAPI_ASSISTANT_ID = "5350de50-a47f-4cd8-9cf3-b1e64ca03a9f";

// Initialize Vapi with your public key
const vapi = new Vapi(VAPI_PUBLIC_KEY);

/**
 * Start a voice call with the pre-configured Vapi assistant
 * @returns {Promise<Call | null>} The call object or null if failed
 */
export const startCall = async () => {
  try {
    console.log('🎙️ Starting Vapi call with assistant:', VAPI_ASSISTANT_ID);
    const call = await vapi.start(VAPI_ASSISTANT_ID);
    console.log('✅ Vapi call started successfully:', call);
    return call;
  } catch (error) {
    console.error('❌ Failed to start Vapi call:', error);
    throw error;
  }
};

/**
 * Stop the current voice call
 */
export const stopCall = () => {
  try {
    console.log('📴 Stopping Vapi call...');
    vapi.stop();
    console.log('✅ Vapi call stopped');
  } catch (error) {
    console.error('❌ Error stopping Vapi call:', error);
  }
};

/**
 * Register callback for when call starts
 * @param {Function} callback - Called when call successfully starts
 */
export const onCallStart = (callback) => {
  vapi.on('call-start', callback);
};

/**
 * Register callback for when call ends
 * @param {Function} callback - Called when call ends
 */
export const onCallEnd = (callback) => {
  vapi.on('call-end', callback);
};

/**
 * Register callback for errors
 * @param {Function} callback - Called when an error occurs
 */
export const onError = (callback) => {
  vapi.on('error', callback);
};

/**
 * Register callback for volume level updates
 * @param {Function} callback - Called with volume level (0-1)
 */
export const onVolumeLevel = (callback) => {
  vapi.on('volume-level', callback);
};

/**
 * Register callback for when user starts speaking
 * @param {Function} callback - Called when speech starts
 */
export const onSpeechStart = (callback) => {
  vapi.on('speech-start', callback);
};

/**
 * Register callback for when user stops speaking
 * @param {Function} callback - Called when speech ends
 */
export const onSpeechEnd = (callback) => {
  vapi.on('speech-end', callback);
};

/**
 * Send a message during the call
 * @param {string} message - The message to send
 */
export const sendMessage = (message) => {
  vapi.send({
    type: 'add-message',
    message: {
      role: 'user',
      content: message,
    },
  });
};

/**
 * Mute or unmute the microphone
 * @param {boolean} muted - True to mute, false to unmute
 */
export const setMuted = (muted) => {
  vapi.setMuted(muted);
};

/**
 * Check if microphone is muted
 * @returns {boolean} True if muted
 */
export const isMuted = () => {
  return vapi.isMuted();
};

/**
 * Make the assistant say something
 * @param {string} message - What the assistant should say
 * @param {boolean} endCallAfterSpoken - End call after speaking
 */
export const say = (message, endCallAfterSpoken = false) => {
  vapi.say(message, endCallAfterSpoken);
};

// Export the vapi instance for advanced usage
export { vapi };
