import Vapi from '@vapi-ai/react-native';
import ENV from '../config/env';

const VAPI_PUBLIC_KEY = ENV.VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = ENV.VAPI_ASSISTANT_ID;

// Public call events the app listens to.
const CALL_EVENTS = ['call-start', 'call-end', 'error', 'volume-level', 'speech-start', 'speech-end'];

// Current Vapi instance used to register listeners + start calls.
let vapi = new Vapi(VAPI_PUBLIC_KEY);

// The instance that actually owns the in-flight/active call. CRITICAL: we stop
// THIS one — not the module `vapi` — because they can diverge (e.g. a stale-state
// retry swaps `vapi`). If we stopped the wrong instance the real call would keep
// streaming on Vapi's servers (the "end call didn't cut the call" bug).
let activeInstance = null;

const freshInstance = () => {
  try {
    vapi.removeAllListeners();
  } catch (e) {}
  vapi = new Vapi(VAPI_PUBLIC_KEY);
  return vapi;
};

/** Hard-stop a Vapi instance: stop() + directly destroy its Daily call object. */
const hardStop = (instance) => {
  if (!instance) return;
  try {
    instance.stop();
  } catch (e) {
    console.error('❌ instance.stop() failed:', e);
  }
  // Belt-and-suspenders: if stop()'s internal cleanup no-oped (its this.call was
  // already cleared by an event), tear down the underlying Daily/WebRTC call so
  // audio + getStats actually stop.
  try {
    const daily = instance.getDailyCallObject && instance.getDailyCallObject();
    if (daily) {
      try { daily.leave(); } catch (e) {}
      try { daily.destroy(); } catch (e) {}
    }
  } catch (e) {}
};

/**
 * Start a voice call with the pre-configured Vapi assistant.
 *
 * The call starts on the CURRENT module instance — the same one the screen just
 * registered its listeners on at mount — so call-start/call-end events reach the
 * screen. We capture it as `activeInstance` and NEVER swap `vapi` mid-call, so
 * stopCall() can reliably stop the exact instance that owns the call.
 *
 * @param {object} [assistantOverrides] - optional Vapi assistantOverrides
 * @returns {Promise<Call|null>}
 */
export const startCall = async (assistantOverrides) => {
  const instance = vapi;
  activeInstance = instance;

  try {
    console.log('🎙️ Starting Vapi call with assistant:', VAPI_ASSISTANT_ID);
    const call = await instance.start(VAPI_ASSISTANT_ID, assistantOverrides);
    if (!call) {
      throw new Error('Vapi returned no call (invalid state)');
    }
    console.log('✅ Vapi call started');
    return call;
  } catch (error) {
    console.error('❌ Failed to start Vapi call:', error);
    hardStop(instance);
    if (activeInstance === instance) activeInstance = null;
    freshInstance(); // clean slate for the next attempt
    throw error;
  }
};

/**
 * Stop the current voice call. Stops the instance that actually started the call
 * (and hard-destroys its Daily call) so the call ends on Vapi's servers — this is
 * what "cuts the call from the backend" when the user hangs up mid-call. Afterward
 * we swap in a fresh instance so the NEXT call starts with no stale state.
 */
export const stopCall = () => {
  console.log('📴 Stopping Vapi call...');
  const owner = activeInstance || vapi;
  hardStop(owner);
  activeInstance = null;
  // Fresh instance for the next call (avoids the SDK's "already-started" state).
  // The next VoiceCall mount re-registers its listeners on this new instance.
  freshInstance();
};

/** True while a call is starting/active. */
export const isCallActive = () => !!activeInstance;

// ── Event registration (always on the current module instance) ────────────────
export const onCallStart = (callback) => vapi.on('call-start', callback);
export const onCallEnd = (callback) => vapi.on('call-end', callback);
export const onError = (callback) => vapi.on('error', callback);
export const onVolumeLevel = (callback) => vapi.on('volume-level', callback);
export const onSpeechStart = (callback) => vapi.on('speech-start', callback);
export const onSpeechEnd = (callback) => vapi.on('speech-end', callback);

/**
 * Remove all consumer call-event listeners on the current instance. The VoiceCall
 * screen calls this on mount (before re-registering) and on unmount so a previous
 * call's stale closures can't fire (e.g. double credit deduction).
 */
export const clearCallListeners = () => {
  try {
    CALL_EVENTS.forEach((evt) => vapi.removeAllListeners(evt));
  } catch (error) {
    console.error('❌ Error clearing Vapi listeners:', error);
  }
};

/** Send a message during the call. */
export const sendMessage = (message) => {
  vapi.send({ type: 'add-message', message: { role: 'user', content: message } });
};

/** Mute or unmute the microphone. */
export const setMuted = (muted) => {
  try {
    (activeInstance || vapi).setMuted(muted);
  } catch (e) {
    console.error('❌ setMuted failed:', e);
  }
};

/** @returns {boolean} */
export const isMuted = () => {
  try {
    return (activeInstance || vapi).isMuted();
  } catch (e) {
    return false;
  }
};

/** Make the assistant say something. */
export const say = (message, endCallAfterSpoken = false) => {
  (activeInstance || vapi).say(message, endCallAfterSpoken);
};

export { vapi };
