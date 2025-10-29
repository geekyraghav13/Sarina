import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const { height } = Dimensions.get('window');
const ITEM_HEIGHT = 60;

interface AgeWheelProps {
  minAge?: number;
  maxAge?: number;
  onAgeChange: (age: number) => void;
  initialAge?: number;
}

export const AgeWheel: React.FC<AgeWheelProps> = ({
  minAge = 18,
  maxAge = 80,
  onAgeChange,
  initialAge = 25,
}) => {
  const [selectedAge, setSelectedAge] = useState(initialAge);
  const ages = Array.from({ length: maxAge - minAge + 1 }, (_, i) => minAge + i);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const age = ages[index];
    if (age && age !== selectedAge) {
      setSelectedAge(age);
      onAgeChange(age);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.selectedIndicator} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.spacer} />
        {ages.map((age) => (
          <View key={age} style={styles.item}>
            <Text
              style={[
                styles.ageText,
                age === selectedAge && styles.ageTextSelected,
              ]}
            >
              {age}
            </Text>
          </View>
        ))}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * 5,
    justifyContent: 'center',
    position: 'relative',
  },
  scrollContent: {
    paddingVertical: 0,
  },
  spacer: {
    height: ITEM_HEIGHT * 2,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageText: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '600',
  },
  ageTextSelected: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  selectedIndicator: {
    height: ITEM_HEIGHT,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FF3263',
  },
});
