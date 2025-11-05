# Firebase Setup Checklist - Production Mode

Follow this checklist to set up Firebase Storage in production mode.

## Pre-requisites
- [ ] Google/Gmail account
- [ ] Videos ready to upload (MP4 format recommended)

## Setup Steps

### 1. Firebase Project Setup
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Create new project or select existing
- [ ] Enable Firebase Storage
- [ ] **Choose "Production Mode"** when prompted
- [ ] Select storage location (closest to your users)

### 2. Get Firebase Configuration
- [ ] Go to Project Settings (⚙️ icon)
- [ ] Click on Web icon (`</>`) to add web app
- [ ] Copy the `firebaseConfig` object
- [ ] Paste config into `app/config/firebase.ts`
- [ ] Replace all placeholder values (apiKey, authDomain, etc.)

### 3. Configure Security Rules (IMPORTANT - Do First!)
- [ ] Go to Firebase Console > Storage > Rules
- [ ] Copy rules from `storage.rules` file in project root
- [ ] Paste into Firebase Console Rules editor
- [ ] Click "Publish"
- [ ] Wait for rules to be deployed (takes ~1 minute)

**OR** use Firebase CLI:
```bash
firebase login
firebase init storage
firebase deploy --only storage
```

### 4. Upload Videos
- [ ] Go to Firebase Console > Storage > Files
- [ ] Create `videos` folder
- [ ] Upload your video files:
  - [ ] `default.mp4` - Default background
  - [ ] `romantic.mp4` - Romantic theme (optional)
  - [ ] `anime.mp4` - Anime style (optional)
  - [ ] `fantasy.mp4` - Fantasy theme (optional)
  - [ ] `minimal.mp4` - Minimal aesthetic (optional)

### 5. Update App Code
- [ ] Replace local video imports with Firebase paths:
  ```typescript
  // Old: <VideoBackground source={require('../../assets/videos/default.mp4')} />
  // New: <VideoBackground firebasePath="videos/default.mp4" />
  ```

### 6. Test Everything
- [ ] Run the app: `npm start`
- [ ] Check videos load correctly
- [ ] No errors in console
- [ ] Videos play smoothly

### 7. Security Verification
- [ ] Videos load in app (read access works) ✅
- [ ] Cannot upload from app (write denied) ✅
- [ ] Check Firebase Console > Storage > Usage for activity

## Troubleshooting

### Videos not loading?
```
Error: Firebase: Error (auth/configuration-not-found)
```
**Fix:** Update `app/config/firebase.ts` with your actual Firebase config

---

```
Error: Firebase Storage: User does not have permission to access
```
**Fix:** Deploy storage rules using steps in section 3

---

```
Error: Network request failed
```
**Fix:** Check internet connection, verify storage bucket exists

### Still having issues?
1. Check Firebase Console > Storage > Rules are deployed
2. Verify videos are uploaded to correct path (`videos/filename.mp4`)
3. Check browser console for detailed error messages
4. Ensure Firebase config is correct (no placeholder values)

## Production Checklist

Before releasing to production:
- [ ] All placeholder configs replaced with real values
- [ ] Security rules deployed and tested
- [ ] Videos compressed for optimal size
- [ ] Test app on different network speeds
- [ ] Set up Firebase budget alerts
- [ ] Monitor usage in first week

## Quick Commands

```bash
# Test if Firebase config is correct
npm start

# Deploy storage rules
firebase deploy --only storage

# Check Firebase CLI is logged in
firebase projects:list

# View storage usage
firebase storage:usage
```

## Support

- 📚 [Full Setup Guide](./FIREBASE_SETUP.md)
- 🔥 [Firebase Console](https://console.firebase.google.com/)
- 📖 [Firebase Storage Docs](https://firebase.google.com/docs/storage)

---

**Need Help?** Check the detailed `FIREBASE_SETUP.md` guide!
