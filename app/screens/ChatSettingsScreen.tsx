import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useGirlfriendStore } from '../store/girlfriendStore';
import { useUserProfile } from '../store/userProfile';
import { logScreenView } from '../services/analyticsService';

type ChatSettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChatSettings'
>;

type ChatSettingsScreenRouteProp = RouteProp<RootStackParamList, 'ChatSettings'>;

interface ChatSettingsScreenProps {
  navigation: ChatSettingsScreenNavigationProp;
  route: ChatSettingsScreenRouteProp;
}

export const ChatSettingsScreen: React.FC<ChatSettingsScreenProps> = ({
  navigation,
}) => {
  const { selectedGirlfriend, deleteConversation } = useGirlfriendStore();
  const { profile } = useUserProfile();

  const [showInWallpaper, setShowInWallpaper] = useState(true);

  React.useEffect(() => {
    logScreenView('ChatSettings');
  }, []);

  const handleNicknamePress = () => {
    // Navigate to nickname edit screen (to be implemented)
    Alert.alert('Coming Soon', 'Nickname editing will be available in next update');
  };

  const handleGirlfriendNamePress = () => {
    // Navigate to girlfriend name edit screen (to be implemented)
    Alert.alert('Coming Soon', 'Name editing will be available in next update');
  };

  const handlePersonalityPress = () => {
    // Navigate to personality selection screen (to be implemented)
    Alert.alert('Coming Soon', 'Personality editing will be available in next update');
  };

  const handleResetConversation = () => {
    if (!selectedGirlfriend) return;

    Alert.alert(
      'Reset Conversation',
      `Are you sure you want to reset your conversation with ${selectedGirlfriend.name}? This will delete all messages and cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            deleteConversation(selectedGirlfriend.id);
            Alert.alert('Success', 'Conversation has been reset', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
        },
      ]
    );
  };

  const handleReportPress = () => {
    navigation.navigate('Report');
  };

  const renderSettingRow = (
    label: string,
    value: string,
    onPress: () => void,
    showChevron = true
  ) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        <Text style={styles.settingValue}>{value}</Text>
        {showChevron && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Card */}
        <View style={styles.settingsCard}>
          {renderSettingRow(
            'Your Nickname',
            profile.name || 'honey',
            handleNicknamePress
          )}

          <View style={styles.divider} />

          {renderSettingRow(
            'Girlfriend Name',
            selectedGirlfriend?.name || 'Sarina',
            handleGirlfriendNamePress
          )}

          <View style={styles.divider} />

          {renderSettingRow(
            'Girlfriend Personality',
            selectedGirlfriend?.personality[0] || 'Adventurous',
            handlePersonalityPress
          )}

          <View style={styles.divider} />

          {/* Wallpaper Toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show girlfriend in wallpaper</Text>
            <Switch
              value={showInWallpaper}
              onValueChange={setShowInWallpaper}
              trackColor={{ false: '#3A3A3A', true: '#C084FC' }}
              thumbColor={showInWallpaper ? '#E9D5FF' : '#8A8A8A'}
              ios_backgroundColor="#3A3A3A"
            />
          </View>

          <View style={styles.divider} />

          {/* Report Issue */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleReportPress}
            activeOpacity={0.7}
          >
            <View style={styles.reportContainer}>
              <Text style={styles.reportIcon}>⚠️</Text>
              <Text style={styles.settingLabel}>Report Issue</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Reset Conversation */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleResetConversation}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingLabel, styles.resetText]}>
              Reset Conversation
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 20,
  },
  reportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reportIcon: {
    fontSize: 18,
  },
  resetText: {
    color: '#FF3263',
  },
});
