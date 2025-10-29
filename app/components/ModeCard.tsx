import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ModeCardProps {
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const ModeCard: React.FC<ModeCardProps> = ({
  title,
  description,
  icon,
  selected,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selected
            ? ['rgba(255, 50, 99, 0.4)', 'rgba(255, 50, 99, 0.2)']
            : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View
          style={[
            styles.content,
            selected && styles.contentSelected,
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  contentSelected: {
    borderColor: '#FF3263',
    borderWidth: 2,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
