import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface ChipSelectorProps {
  options: string[];
  selected: string[];
  onSelect: (option: string) => void;
  multiSelect?: boolean;
  style?: ViewStyle;
}

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  options,
  selected,
  onSelect,
  multiSelect = true,
  style,
}) => {
  const isSelected = (option: string) => selected.includes(option);

  const handlePress = (option: string) => {
    onSelect(option);
  };

  return (
    <View style={[styles.container, style]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.chip, isSelected(option) && styles.chipSelected]}
          onPress={() => handlePress(option)}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.chipText, isSelected(option) && styles.chipTextSelected]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipSelected: {
    backgroundColor: '#FF3263',
    borderColor: '#FF3263',
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  chipTextSelected: {
    fontWeight: '700',
  },
});
