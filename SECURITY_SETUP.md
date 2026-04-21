# Security Setup Guide

## API Keys Configuration

This project uses a secure environment configuration system to protect sensitive API keys.

### Initial Setup

1. **Copy the environment template:**
   ```bash
   cp app/config/env.example.ts app/config/env.ts
   ```

2. **Fill in your API keys in `app/config/env.ts`:**
   - Get your Gemini API key from: https://makersuite.google.com/app/apikey
   - Get your Vapi keys from: https://vapi.ai/dashboard

3. **Never commit `app/config/env.ts`** - This file is automatically gitignored

### Files Overview

- **`app/config/env.ts`** - Contains your actual API keys (gitignored, never commit)
- **`app/config/env.example.ts`** - Template file (safe to commit)
- **`.env`** - Alternative env file (also gitignored)
- **`.env.example`** - Example env file (safe to commit)

### Security Best Practices

✅ **Safe to commit:**
- `app/config/env.example.ts`
- `.env.example`
- Any code that imports from `../config/env`

❌ **NEVER commit:**
- `app/config/env.ts` (actual keys)
- `.env` (actual keys)
- Any file with hardcoded API keys

### Current API Keys Setup

The project uses:
- **Gemini API** - For AI chat functionality
- **Vapi API** - For voice call features

Both are now properly configured via the environment system.

### For Team Members

When cloning this repo:
1. Copy `app/config/env.example.ts` to `app/config/env.ts`
2. Ask the project owner for the actual API keys
3. Fill them in your local `env.ts` file
4. Never commit your `env.ts` file

### Production Deployment

For production builds, consider:
1. Using EAS Secrets for Expo builds
2. Moving sensitive API calls to a backend server
3. Using environment-specific configurations

## Verification

To verify your setup is correct:

```bash
# Check that env.ts is gitignored
git status | grep "env.ts"
# Should NOT appear in the output

# Check that the app can import the config
node -e "console.log(require('./app/config/env.ts'))"
# Should show your environment variables
```
