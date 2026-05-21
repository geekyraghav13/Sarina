/**
 * Environment Configuration Template
 * Copy this file to env.ts and fill in your actual API keys
 *
 * INSTRUCTIONS:
 * 1. Copy this file: cp app/config/env.example.ts app/config/env.ts
 * 2. Fill in your actual API keys in the new env.ts file
 * 3. Never commit env.ts (it's in .gitignore)
 *
 * NOTE: Gemini API key belongs in backend/.env only — never in this file.
 */

const ENV = {
  // Vapi keys (public keys are safe to commit, but keeping them here for consistency)
  VAPI_PUBLIC_KEY: 'YOUR_VAPI_PUBLIC_KEY_HERE',
  VAPI_ASSISTANT_ID: 'YOUR_VAPI_ASSISTANT_ID_HERE',
};

export default ENV;
