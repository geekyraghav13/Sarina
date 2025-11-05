# 🚀 Firebase Quick Start - Production Mode

**5-Minute Setup Guide for Firebase Storage**

## 📋 Prerequisites
- [ ] Firebase account (Google account)
- [ ] Videos ready (MP4 format)

## ⚡ Quick Setup (5 steps)

### 1️⃣ Create Firebase Project (2 min)
```
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter name → Follow wizard → Create
4. Click Storage → Get Started → Production Mode
5. Choose location → Done
```

### 2️⃣ Get Your Config (1 min)
```
1. Click ⚙️ (settings) → Project settings
2. Scroll to "Your apps" → Click </> (web icon)
3. Register app → Copy firebaseConfig object
4. Open app/config/firebase.ts
5. Paste your config (replace all YOUR_* placeholders)
```

### 3️⃣ Deploy Security Rules (30 sec)
**Copy this to Firebase Console > Storage > Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /videos/{videoFile} {
      allow read: if true;
      allow write: if false;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```
Click **Publish** → Wait 30 seconds

### 4️⃣ Upload Videos (1 min)
```
1. Firebase Console > Storage > Files
2. Click "Create folder" → Name it "videos"
3. Click videos folder → Upload file
4. Upload: default.mp4 (and any others)
```

### 5️⃣ Test App (30 sec)
```bash
npm start
# Videos should load from Firebase! 🎉
```

---

## 🎯 That's it! Your app now loads videos from Firebase!

## 📝 What We Set Up

✅ **Firebase Storage** - Cloud storage for videos
✅ **Security Rules** - Public read, no write (secure!)
✅ **Video Manager** - Smart caching & loading
✅ **VideoBackground** - Supports Firebase URLs

## 🔧 Using in Your App

### Simple Usage
```typescript
<VideoBackground firebasePath="videos/default.mp4" />
```

### With Local Fallback
```typescript
<VideoBackground
  firebasePath="videos/default.mp4"
  source={require('../../assets/videos/default.mp4')}
/>
```

### Different Videos per Theme
```typescript
// The app automatically picks the right video based on appearance
<VideoBackground firebasePath={getVideoForAppearance(profile.appearance)} />
```

## 🐛 Quick Fixes

### Videos not loading?
1. Check `app/config/firebase.ts` has your real config (no YOUR_*)
2. Verify videos uploaded to `videos/` folder in Firebase
3. Confirm security rules are published

### "Permission denied" error?
- Deploy security rules (see step 3)
- Make sure you clicked "Publish" in Firebase Console

### Videos slow to load?
- Compress videos (keep under 20MB)
- Videos are cached after first load

## 📚 More Info

- **Detailed Guide:** [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Checklist:** [FIREBASE_CHECKLIST.md](./FIREBASE_CHECKLIST.md)
- **Storage Rules:** [storage.rules](./storage.rules)

## 💰 Costs

Firebase Storage is **FREE** for:
- First 5GB storage
- First 1GB/day downloads

Perfect for small apps! 🎉

---

## 🎬 Video Requirements

- **Format:** MP4 (H.264)
- **Size:** Under 50MB recommended
- **Resolution:** 1080p (1920x1080 or 1080x1920)
- **Duration:** 10-30 seconds (loops automatically)

## 🔐 Security Summary

✅ **Anyone can download videos** (needed for app)
❌ **No one can upload from app** (prevents abuse)
🔒 **Only you can upload** (via Firebase Console)

This is **production-ready** and secure! 🛡️

---

**Questions?** Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed info!
