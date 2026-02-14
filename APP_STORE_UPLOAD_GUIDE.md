# 📱 How to Upload iOS Build to App Store Connect (Without Mac)

**Build Status:** ✅ Successful
**Build ID:** aa49d9d8-467d-4a56-a424-e44d49850ff8
**Version:** 1.3.9 (Build 5)
**IPA Location:** `/home/raghav/Downloads/Sarina_Build5.ipa` (20MB)

---

## 🚧 Current Issue

**EAS Submit requires App Store Connect API Keys** to be configured, but this setup needs interactive mode which we can't use in automated scripts.

**Error:** "App Store Connect API Keys cannot be set up in --non-interactive mode"

---

## ✅ Solutions (Choose One)

### **Option 1: Use Transporter App on iPhone/iPad** (Easiest if you have iOS device)

1. **Install Transporter:**
   - Open App Store on your iPhone/iPad
   - Search for "Transporter"
   - Install the free app (by Apple)

2. **Transfer the IPA file:**
   - Upload `/home/raghav/Downloads/Sarina_Build5.ipa` to Google Drive, Dropbox, or any cloud storage
   - Download it to your iPhone/iPad (Files app)

3. **Upload to App Store Connect:**
   - Open Transporter app
   - Sign in with: `geekyraghav13@gmail.com`
   - Tap the "+" button
   - Select `Sarina_Build5.ipa`
   - Tap "Deliver"
   - Wait 5-10 minutes for upload to complete

4. **Done!**
   - Build will appear in App Store Connect in ~10 minutes
   - Available in TestFlight in ~15 minutes

---

### **Option 2: Automated Retry Script** (Wait for EAS Submit to recover)

EAS Submit is experiencing delays but is still operational. We can retry automatically:

```bash
# Run the automated retry script (tries every 15 minutes for 2 hours)
cd "/home/raghav/Vibe COded Apps/sarina"
./retry_submit.sh
```

**What it does:**
- Attempts submission every 15 minutes
- Automatically retries up to 8 times (2 hours total)
- Exits when successful
- Press Ctrl+C to stop

**However:** This will still fail until you set up App Store Connect API Keys interactively (see Option 3)

---

### **Option 3: Set Up App Store Connect API Keys** (One-time setup)

This is needed for EAS Submit to work automatically. You need to do this **once** in interactive mode:

```bash
cd "/home/raghav/Vibe COded Apps/sarina"

# Run EAS submit in interactive mode
# This will prompt you to set up App Store Connect API Key
npx eas submit --platform ios --latest
```

**Follow the prompts:**
1. "Do you want to set up App Store Connect API Key?" → Yes
2. Choose "Generate a new API Key"
3. Provide your Apple ID password when prompted
4. EAS will automatically create and configure the API key

**After this one-time setup:**
- Future submissions will work in non-interactive mode
- You can use automated scripts
- No manual upload needed

---

### **Option 4: Ask Someone with a Mac** (If you have access)

If you know someone with a Mac:

1. Send them the IPA file: `/home/raghav/Downloads/Sarina_Build5.ipa`
2. They install Transporter app on Mac (free from Mac App Store)
3. They upload it using your credentials:
   - Apple ID: `geekyraghav13@gmail.com`
   - App-Specific Password: `aiyl-rmxf-mcar-rfxl`

---

## 🎯 Recommended Approach

**Best for you:** **Option 1 (iPhone/iPad Transporter app)**

Why:
- ✅ Works without Mac
- ✅ Most reliable method
- ✅ No technical setup needed
- ✅ Same app Apple provides for Mac
- ✅ Completes in ~15 minutes

**Alternative:** **Option 3 (Set up API Keys once)**

Why:
- ✅ Future submissions are automated
- ✅ No manual upload ever again
- ❌ Requires one-time interactive setup

---

## 📊 After Upload (Any Method)

Once the IPA is uploaded to App Store Connect:

### 1. Verify Upload (5-10 minutes)
- Go to: https://appstoreconnect.apple.com
- Sign in with `geekyraghav13@gmail.com`
- Navigate to: **My Apps** → **Sarina**
- Click **TestFlight** tab
- You should see **Build 5 (1.3.9)** listed

### 2. TestFlight Availability (10-15 minutes)
- Build processes automatically
- "Processing" → "Ready to Test"
- Receive email when ready

### 3. Add Testers
**Internal Testing (Immediate):**
- Click on Build 5
- Click "Internal Testing" group
- Add testers (up to 100)
- They get TestFlight invite instantly

**External Testing (Needs Beta App Review):**
- Create external testing group
- Add testers
- Submit for Beta App Review (~24 hours)
- Testers get access after approval

### 4. Submit for App Review (When ready)
- Go to **App Store** tab (not TestFlight)
- Click **+ Version** or select existing version
- Select Build 5 (1.3.9)
- Fill in "What's New" text
- Click **Submit for Review**
- Review takes 1-3 days typically

---

## 📋 Checklist Before App Review

Make sure these are complete in App Store Connect:

### App Information:
- [ ] App Name: Sarina
- [ ] Privacy Policy URL: ________________
- [ ] Terms of Service URL: ________________
- [ ] Support URL: ________________

### Version Information:
- [ ] Screenshots uploaded (required for all sizes)
- [ ] Description written (compelling copy)
- [ ] Keywords added (search optimization)
- [ ] "What's New" text (for this version)

### Subscriptions:
- [ ] `com.sarina.app.weekly` - Status: Ready to Submit
- [ ] `com.sarina.app.yearly` - Status: Ready to Submit

### App Review Information:
- [ ] Demo account credentials (if features require login)
- [ ] Notes for reviewer (explain AI companion, mature content)
- [ ] Contact information

### Age Rating:
- [ ] Questionnaire completed
- [ ] Likely 17+ due to mature themes

---

## 🔑 Important Credentials

**Apple ID:** geekyraghav13@gmail.com
**App-Specific Password:** aiyl-rmxf-mcar-rfxl
**Bundle ID:** com.sarina.app
**App Store ID:** 6758547730

**Subscription Product IDs:**
- Weekly: `com.sarina.app.weekly`
- Yearly: `com.sarina.app.yearly`

---

## 🐛 Troubleshooting

### "Invalid IPA" Error
**Solution:** Re-download from EAS:
```bash
curl -L -o /home/raghav/Downloads/Sarina_Build5.ipa \
  "https://expo.dev/artifacts/eas/n2C1U4Qcku825XfgSHViJY.ipa"
```

### "Wrong Bundle ID" Error
**Solution:** IPA is correctly configured with `com.sarina.app` - no action needed

### "Missing Compliance" Error
**Solution:** Already configured in app.json:
```json
"config": {
  "usesNonExemptEncryption": false
}
```

### "Transporter Upload Fails"
**Solution:**
1. Check internet connection
2. Verify Apple ID credentials
3. Try again in 10-15 minutes (server issues)

---

## ⏱️ Timeline

**From upload to App Store:**

| Step | Time |
|------|------|
| Upload IPA via Transporter | 5-10 min |
| Processing in App Store Connect | 5-10 min |
| Available in TestFlight | Total: ~15-20 min |
| Internal testers can test | Immediately after processing |
| Beta App Review (external testers) | ~24 hours |
| App Store Review | 1-3 days |
| Live on App Store | Immediate after approval |

**Total estimated time:** ~2-4 days (if you submit for review immediately)

---

## 📞 Support Resources

**If upload fails:**
- Expo Discord: https://chat.expo.dev
- EAS Support: https://expo.dev/support
- Apple Developer Support: https://developer.apple.com/contact/

**App Store Connect:**
- Dashboard: https://appstoreconnect.apple.com
- Help: https://developer.apple.com/support/app-store-connect/

**Project:**
- GitHub: https://github.com/geekyraghav13/Sarina
- Build Logs: https://expo.dev/accounts/8284/projects/sarina/builds

---

## 🎊 Summary

**What's Done:**
- ✅ iOS build completed successfully
- ✅ IPA file downloaded (20MB)
- ✅ All iOS features match Android (subscriptions, voice, credits)
- ✅ Ready for App Store Connect upload

**What's Pending:**
- ⏳ Upload IPA to App Store Connect (use Transporter on iPhone/iPad)
- ⏳ Wait for processing (~15 min)
- ⏳ Add TestFlight testers
- ⏳ Submit for App Review
- ⏳ Launch on App Store (after approval)

**Next Action:**
**Use Transporter app on your iPhone/iPad to upload the IPA file.** This is the simplest solution without needing a Mac.

---

**Build Details:**
- Build ID: aa49d9d8-467d-4a56-a424-e44d49850ff8
- Build URL: https://expo.dev/accounts/8284/projects/sarina/builds/aa49d9d8-467d-4a56-a424-e44d49850ff8
- IPA Download: https://expo.dev/artifacts/eas/n2C1U4Qcku825XfgSHViJY.ipa

---

**Good luck! The iOS app is ready for the App Store!** 🚀🍎
