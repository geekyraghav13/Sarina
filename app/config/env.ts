/**
 * Environment Configuration
 * This file loads environment-specific values
 * DO NOT commit actual API keys to this file
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to env.local.ts
 * 2. Add your actual API keys to env.local.ts
 * 3. Never commit env.local.ts to git
 */

// Default empty configuration - override in env.local.ts
const ENV = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  VAPI_PUBLIC_KEY: process.env.VAPI_PUBLIC_KEY || '',
  VAPI_ASSISTANT_ID: process.env.VAPI_ASSISTANT_ID || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
};

// Try to load local environment overrides
try {
  const localEnv = require('./env.local').default;
  Object.assign(ENV, localEnv);
} catch (e) {
  console.warn('No local env.local.ts found. Using environment variables or defaults.');
}

export default ENV;
