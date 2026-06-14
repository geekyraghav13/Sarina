/**
 * Horizontal scrollable category filter bar for the character grids.
 *
 * Shows an "All" pill first, then every category in CHARACTER_CATEGORIES.
 * The active pill is highlighted in the app's pink. Purely presentational —
 * the parent owns the selected value and the filtering.
 */

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  CHARACTER_CATEGORIES,
  ALL_CATEGORY,
  Character,
} from '../data/characters';

type Props = {
  selected: string;
  onSelect: (category: string) => void;
  /** Optional: hide categories that have no characters in the current roster. */
  available?: string[];
  style?: object;
};

export const CATEGORY_BAR_OPTIONS = [ALL_CATEGORY, ...CHARACTER_CATEGORIES];

/** Filter a roster by the selected category ("All" returns everything). */
export const filterByCategory = (
  characters: Character[],
  category: string,
): Character[] =>
  category === ALL_CATEGORY
    ? characters
    : characters.filter((c) => c.categories?.includes(category));

export const CategoryBar: React.FC<Props> = ({
  selected,
  onSelect,
  available,
  style,
}) => {
  const options = available
    ? CATEGORY_BAR_OPTIONS.filter(
        (o) => o === ALL_CATEGORY || available.includes(o),
      )
    : CATEGORY_BAR_OPTIONS;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, style]}
    >
      {options.map((option) => {
        const active = option === selected;
        return (
          <TouchableOpacity
            key={option}
            activeOpacity={0.85}
            onPress={() => onSelect(option)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#1d1d22',
    borderWidth: 1,
    borderColor: '#2a2a30',
  },
  pillActive: {
    backgroundColor: '#ff5070',
    borderColor: '#ff5070',
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#a0a0a5',
  },
  labelActive: {
    color: '#ffffff',
  },
});
