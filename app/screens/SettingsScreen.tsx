import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { logScreenView } from '../services/analyticsService';

interface SettingsScreenProps {}

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  React.useEffect(() => {
    logScreenView('Settings');
  }, []);

  const handlePrivacyPolicy = async () => {
    const url = 'https://sarina-ai-companion.lovable.app/privacy';
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open Privacy Policy:', error);
    }
  };

  const handleTermsOfUse = async () => {
    const url = 'https://sarina-ai-companion.lovable.app/terms';
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open Terms of Use:', error);
    }
  };

  const handleRateUs = async () => {
    // For now, we'll use a placeholder. Replace with actual Play Store URL when published
    const playStoreUrl = Platform.select({
      android: 'https://play.google.com/store/apps/details?id=com.sarina.app',
      ios: 'https://apps.apple.com/app/sarina-ai/id123456789', // Replace with actual App Store ID
    });

    try {
      if (playStoreUrl) {
        await Linking.openURL(playStoreUrl);
      }
    } catch (error) {
      console.error('Failed to open store:', error);
    }
  };

  const handleShareApp = async () => {
    try {
      const message = Platform.select({
        android: `Check out Sarina AI - Your AI Girlfriend Companion!\n\nhttps://play.google.com/store/apps/details?id=com.sarina.app`,
        ios: `Check out Sarina AI - Your AI Girlfriend Companion!\n\nhttps://apps.apple.com/app/sarina-ai/id123456789`,
        default: `Check out Sarina AI - Your AI Girlfriend Companion!`,
      });

      await Share.share({
        message: message || 'Check out Sarina AI - Your AI Girlfriend Companion!',
        title: 'Share Sarina AI',
      });
    } catch (error) {
      console.error('Failed to share app:', error);
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void
  ) => {
    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingIcon}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your app preferences
        </Text>
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          {renderSettingItem(
            '📄',
            'Privacy Policy',
            'View our privacy policy',
            handlePrivacyPolicy
          )}
          {renderSettingItem(
            '📋',
            'Terms of Use',
            'View terms and conditions',
            handleTermsOfUse
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderSettingItem(
            '⭐',
            'Rate Us',
            'Rate the app on store',
            handleRateUs
          )}
          {renderSettingItem(
            '📤',
            'Share App',
            'Share with your friends',
            handleShareApp
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Sarina AI</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>
            © 2026 Sarina AI. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF3263',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Space for bottom nav
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 50, 99, 0.2)',
    borderWidth: 1,
    borderColor: '#FF3263',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  chevron: {
    fontSize: 28,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '300',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 32,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3263',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
});
