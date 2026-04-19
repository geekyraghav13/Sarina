# Sarina AI - Documentation Index

This directory contains all documentation for the Sarina AI mobile application.

---

## 📁 Documentation Structure

### `/current` - Current Production Documentation

Essential documentation for the production system:

1. **[ANALYTICS_MONITORING_COMPLETE.md](current/ANALYTICS_MONITORING_COMPLETE.md)**
   - Complete implementation summary of analytics and monitoring
   - Deployment instructions
   - All new features and integrations
   - **Status**: ✅ Production-Ready

2. **[DEPLOYMENT_READY.md](current/DEPLOYMENT_READY.md)**
   - Production deployment checklist
   - Edge case fixes and scalability improvements
   - Cost savings analysis (90% reduction)
   - Monitoring and alert setup

3. **[IMPLEMENTATION_SUMMARY.md](current/IMPLEMENTATION_SUMMARY.md)**
   - Technical implementation details
   - Batched credit deduction system
   - Crash recovery mechanism
   - Atomic operations and security

4. **[MONITORING_SETUP.md](current/MONITORING_SETUP.md)**
   - Cloud Monitoring setup guide
   - Alert policy configuration
   - Dashboard creation
   - Structured logging format

5. **[FLAGGED_ACCOUNTS_REVIEW.md](current/FLAGGED_ACCOUNTS_REVIEW.md)**
   - Flagged accounts review procedures
   - CLI tool usage
   - Web dashboard guide
   - Common scenarios and workflows

---

### `/legal` - Legal Documents

User-facing legal documents:

1. **[PRIVACY_POLICY.md](legal/PRIVACY_POLICY.md)**
   - Privacy policy for app stores
   - Data collection and usage
   - User rights

2. **[TERMS_OF_USE.md](legal/TERMS_OF_USE.md)**
   - Terms of service
   - User agreements
   - Liability disclaimers

---

### `/archived` - Historical Documentation

Old build documentation and migration plans:

1. **BUILD_38_DOCUMENTATION.md** - Build 38 changes
2. **BUILD_39_PCM_STREAMING_REFACTOR.md** - PCM streaming refactor
3. **BUILD44_DOCUMENTATION.md** - Google branding & UX fixes
4. **BUILD45_DOCUMENTATION.md** - Build 45 changes
5. **BUILD52_DOCUMENTATION.md** - Build 52 changes
6. **voice_migration_plan.md** - Voice call migration specification
7. **CONSUMABLE_CREDITS_SETUP.md** - Initial credits setup guide

---

## 🚀 Quick Start

### For New Developers

1. Start with [ANALYTICS_MONITORING_COMPLETE.md](current/ANALYTICS_MONITORING_COMPLETE.md) for overview
2. Read [IMPLEMENTATION_SUMMARY.md](current/IMPLEMENTATION_SUMMARY.md) for technical details
3. Follow [DEPLOYMENT_READY.md](current/DEPLOYMENT_READY.md) for deployment

### For Operations

1. Review [MONITORING_SETUP.md](current/MONITORING_SETUP.md) for alerts
2. Use [FLAGGED_ACCOUNTS_REVIEW.md](current/FLAGGED_ACCOUNTS_REVIEW.md) for account management

### For Legal/Compliance

1. Update [PRIVACY_POLICY.md](legal/PRIVACY_POLICY.md) as needed
2. Update [TERMS_OF_USE.md](legal/TERMS_OF_USE.md) as needed

---

## 📊 System Overview

### Architecture

- **Frontend**: React Native (Expo) mobile app
- **Backend**: Firebase (Firestore, Cloud Functions, Analytics)
- **Voice**: Vapi integration
- **Payments**: RevenueCat
- **Monitoring**: Google Cloud Monitoring

### Key Features

1. **Credit System**
   - Batched deduction (10s intervals)
   - Atomic operations (prevent double-charge)
   - Zero-balance policy (no negatives)
   - Crash recovery

2. **Analytics**
   - Firebase Analytics integration
   - 10 monetization events tracked
   - Client and server-side logging

3. **Monitoring**
   - Cloud Monitoring alerts
   - Email notifications
   - Custom dashboards
   - Flagged accounts review system

4. **Cost Optimization**
   - 90% reduction in Firestore writes
   - Batched operations
   - Efficient reconciliation

---

## 🔗 External Links

- **Review Dashboard**: https://us-central1-sarina-ai-2b2c1.cloudfunctions.net/reviewDashboard
- **Cloud Monitoring**: https://console.cloud.google.com/monitoring/dashboards?project=sarina-ai-2b2c1
- **Firebase Console**: https://console.firebase.google.com/project/sarina-ai-2b2c1
- **Cloud Functions**: https://console.firebase.google.com/project/sarina-ai-2b2c1/functions

---

## 📝 Maintenance

### Documentation Updates

When updating documentation:
1. Update the relevant file in `/current`
2. Move outdated docs to `/archived` with date suffix
3. Update this INDEX.md file
4. Document breaking changes in changelog

### Version Control

- Keep current production docs in `/current`
- Archive old versions with date: `filename_YYYYMMDD.md`
- Don't delete archived docs (useful for troubleshooting)

---

## 🆘 Support

For questions or issues:
1. Check relevant documentation in `/current`
2. Review `/archived` for historical context
3. Check Cloud Function logs
4. Review monitoring dashboards

---

**Last Updated**: April 19, 2026
**Version**: 1.0
**Status**: Production
