/**
 * Shared bottom navigation bar for the main app tabs (Figma 23:55 / 39:1138).
 * Discover ↔ Messages switch via the stack; Settings is a placeholder until
 * that screen exists.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHomeStrings } from '../../data/onboardingStrings';

type Tab = 'discover' | 'messages' | 'settings';

type Props = {
  active: Tab;
  onDiscover?: () => void;
  onMessages?: () => void;
  onSettings?: () => void;
};

export const BottomNav: React.FC<Props> = ({ active, onDiscover, onMessages, onSettings }) => {
  const insets = useSafeAreaInsets();
  const strings = useHomeStrings();

  const item = (
    tab: Tab,
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress?: () => void
  ) => {
    const isActive = active === tab;
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isActive || !onPress}
      >
        <Ionicons name={icon} size={22} color={isActive ? '#ffb2b9' : '#5a5a65'} />
        <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.bar, { bottom: insets.bottom + 12 }]}>
      {item('discover', active === 'discover' ? 'compass' : 'compass-outline', strings.navDiscover, onDiscover)}
      {item('messages', active === 'messages' ? 'chatbubble' : 'chatbubble-outline', strings.navMessages, onMessages)}
      {item('settings', active === 'settings' ? 'settings' : 'settings-outline', strings.navSettings, onSettings)}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 34,
    right: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(21,21,26,0.95)',
    shadowColor: '#a83452',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  item: { alignItems: 'center', gap: 2 },
  label: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16.8,
    color: '#5a5a65',
  },
  labelActive: { color: '#ffb2b9' },
});
