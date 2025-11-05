# Firebase Video Storage Setup Guide

This guide will help you set up Firebase Storage for your video backgrounds.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "Sarina AI")
4. Follow the setup wizard (you can disable Google Analytics if not needed)
5. Click "Create Project"

## Step 2: Enable Firebase Storage

1. In your Firebase project, click on "Storage" in the left sidebar
2. Click "Get Started"
3. **Choose "Start in production mode"** (recommended for better security)
4. Select a Cloud Storage location (choose one closest to your users)
5. Click "Done"

**Note:** Production mode starts with deny-all rules. We'll configure proper rules in Step 6.

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "Sarina Web")
6. Copy the `firebaseConfig` object

## Step 4: Update Firebase Configuration in App

1. Open `app/config/firebase.ts`
2. Replace the placeholder values with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Configure Storage Security Rules (IMPORTANT - Do this first!)

**⚠️ IMPORTANT:** Configure security rules BEFORE uploading videos, otherwise you won't be able to upload in production mode.

### Method 1: Using Firebase Console (Quick)

1. Go to Firebase Console > Storage > Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Videos folder - Public read, no write
    match /videos/{videoFile} {
      allow read: if true;
      allow write: if false;
    }
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish"

### Method 2: Using Firebase CLI (Recommended)

1. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (from project root):
   ```bash
   firebase init storage
   ```
   - Select your Firebase project
   - Choose the default `storage.rules` file

4. The `storage.rules` file is already created in your project root. Deploy it:
   ```bash
   firebase deploy --only storage
   ```

**✅ You're now ready to upload videos!**

## Step 6: Upload Videos to Firebase Storage

### Option 1: Using Firebase Console (Easiest)

1. Go to Firebase Console > Storage
2. Click on the "Files" tab
3. Click "Create folder" and name it `videos`
4. Click on the `videos` folder
5. Click "Upload file" and select your video files one by one
6. Final structure should look like:
   ```
   videos/
   ├── default.mp4
   ├── romantic.mp4
   ├── anime.mp4
   ├── fantasy.mp4
   └── minimal.mp4
   ```

### Option 2: Using gsutil (For bulk uploads)

1. Install Google Cloud SDK with gsutil
2. Upload all videos at once:
   ```bash
   gsutil -m cp -r ./videos gs://YOUR-PROJECT-ID.appspot.com/
   ```

## Step 7: Security Rules Explained

The `storage.rules` file in your project contains production-ready security rules:

### Videos Folder Rules
```javascript
match /videos/{videoFile} {
  allow read: if true;   // ✅ Anyone can read/download videos (needed for app)
  allow write: if false;  // ❌ No one can write (upload/delete) via client app
}
```

**Why these rules?**
- ✅ **Public read access** - Users can download and view videos in the app
- ❌ **No write access** - Prevents unauthorized video uploads/deletions
- 🔒 **Admin uploads only** - Videos can only be uploaded via Firebase Console (where you're authenticated)

### Additional Security Features (Already in storage.rules)

1. **User Uploads** (for future profile pictures):
   - Users can only access their own uploads
   - File size limited to 5MB
   ```javascript
   match /user-uploads/{userId}/{allPaths=**} {
     allow read: if request.auth != null && request.auth.uid == userId;
     allow write: if request.auth != null
                  && request.auth.uid == userId
                  && request.resource.size < 5 * 1024 * 1024;
   }
   ```

2. **Admin Folder** (for future admin features):
   - Only authenticated admins can access
   ```javascript
   match /admin/{allPaths=**} {
     allow read, write: if request.auth != null
                        && request.auth.token.admin == true;
   }
   ```

3. **Default Deny**:
   - All other paths are denied by default
   ```javascript
   match /{allPaths=**} {
     allow read, write: if false;
   }
   ```

## Step 8: Using Firebase Videos in Your App

### Method 1: Using Firebase Path (Recommended)

Update your screens to use `firebasePath` instead of local `source`:

```typescript
// Before
<VideoBackground source={require('../../assets/videos/default.mp4')} />

// After
<VideoBackground firebasePath="videos/default.mp4" />
```

### Method 2: Dynamic Video Based on Appearance

For screens where you want different videos based on user selection:

```typescript
import { getVideoForAppearance } from '../utils/videoManager';
import { useUserProfile } from '../store/userProfile';

const { profile } = useUserProfile();
const [videoPath, setVideoPath] = useState('videos/default.mp4');

useEffect(() => {
  const loadVideo = async () => {
    try {
      const path = await getVideoForAppearance(profile.appearance);
      setVideoPath(path);
    } catch (error) {
      console.error('Error loading video:', error);
    }
  };
  loadVideo();
}, [profile.appearance]);

// Use in component
<VideoBackground firebasePath={videoPath} />
```

### Method 3: With Local Fallback

Keep local video as fallback if Firebase fails:

```typescript
<VideoBackground
  firebasePath="videos/default.mp4"
  source={require('../../assets/videos/default.mp4')}
/>
```

## Step 9: Verify Security Rules are Working

Test your security rules:

1. **Test Read Access (Should Work):**
   - Open your app
   - Videos should load successfully from Firebase
   - Check browser/app console for any errors

2. **Test Write Protection (Should Fail):**
   - Try to upload a file via the Firebase SDK from client code
   - It should be denied with permission error
   - This is correct behavior!

3. **Monitor in Firebase Console:**
   - Go to Storage > Usage tab
   - Check download statistics
   - Go to Storage > Rules tab
   - Click "Rules Playground" to test rules

## Step 10: Preload Videos (Optional)

For better performance, preload videos when the app starts:

```typescript
// In App.tsx or main entry point
import { preloadVideoUrls, VIDEO_PATHS } from './app/utils/videoManager';

useEffect(() => {
  preloadVideoUrls([
    VIDEO_PATHS.DEFAULT,
    VIDEO_PATHS.ROMANTIC,
    VIDEO_PATHS.ANIME,
    VIDEO_PATHS.FANTASY,
    VIDEO_PATHS.MINIMAL,
  ]);
}, []);
```

## Video Requirements

- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1080x1920 (portrait) or 1920x1080 (landscape)
- **File Size**: Keep under 50MB per video for better loading
- **Duration**: 10-30 seconds (looped videos)
- **Frame Rate**: 30fps recommended

## Video Naming Convention

Use descriptive names in Firebase Storage:
- `videos/default.mp4` - Default background
- `videos/romantic.mp4` - Romantic theme
- `videos/anime.mp4` - Anime style
- `videos/fantasy.mp4` - Fantasy theme
- `videos/minimal.mp4` - Minimal aesthetic

## Troubleshooting

### Videos not loading?
1. Check Firebase config is correct
2. Verify Storage is enabled in Firebase Console
3. Check Storage Rules allow read access
4. Verify video files are uploaded to correct path

### Slow loading?
1. Reduce video file size (compress videos)
2. Use preloading for commonly used videos
3. Implement video caching (already built-in)

### CORS errors?
1. Add your domain to allowed origins in Firebase Storage settings
2. For development, test mode should allow all origins

## Cost Optimization

Firebase Storage pricing:
- **Storage**: $0.026/GB per month
- **Download**: $0.12/GB

Tips to reduce costs:
1. Compress videos to smaller sizes
2. Use caching (already implemented)
3. Monitor usage in Firebase Console
4. Set up budget alerts

## Next Steps

1. ✅ Configure Firebase project
2. ✅ Upload your videos
3. ✅ Update screens to use Firebase videos
4. ✅ Test video loading
5. ✅ Secure Storage rules for production
6. ✅ Monitor usage and costs

---

For more information, visit:
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Expo Video Documentation](https://docs.expo.dev/versions/latest/sdk/video/)
