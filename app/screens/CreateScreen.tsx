import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type CreateScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Create'
>;

interface CreateScreenProps {
  navigation: CreateScreenNavigationProp;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ navigation }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const iconScales = [
    useState(new Animated.Value(0))[0],
    useState(new Animated.Value(0))[0],
    useState(new Animated.Value(0))[0],
  ];

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate icons sequentially
    iconScales.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: 400 + index * 150,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleStart = () => {
    navigation.navigate('Age');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative Circles */}
        <View style={styles.circlesContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
          <View style={[styles.circle, styles.circle4]} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Top Section - Icon Grid */}
          <View style={styles.topSection}>
            <View style={styles.iconGrid}>
              <Animated.View style={[styles.iconBox, { transform: [{ scale: iconScales[0] }] }]}>
                <LinearGradient
                  colors={['#FF6B9D', '#FF8FAB']}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="chatbubbles" size={40} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.iconLabel}>Chat</Text>
              </Animated.View>

              <Animated.View style={[styles.iconBox, { transform: [{ scale: iconScales[1] }] }]}>
                <LinearGradient
                  colors={['#C06C84', '#D88FA8']}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="call" size={40} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.iconLabel}>Voice</Text>
              </Animated.View>

              <Animated.View style={[styles.iconBox, { transform: [{ scale: iconScales[2] }] }]}>
                <LinearGradient
                  colors={['#6C5B7B', '#8B7B9B']}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="heart" size={40} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.iconLabel}>Connect</Text>
              </Animated.View>
            </View>
          </View>

          {/* Bottom Section - Text & Button */}
          <View style={styles.bottomSection}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Your</Text>
              <LinearGradient
                colors={['#FF6B9D', '#FF8FAB', '#C06C84']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleAccentGradient}
              >
                <Text style={styles.titleAccent}>AI Companion</Text>
              </LinearGradient>
              <Text style={styles.subtitle}>
                Personalized conversations and connections tailored just for you
              </Text>

              {/* Feature List */}
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.featureText}>Customize personality & appearance</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.featureText}>Natural voice conversations</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.featureText}>Available 24/7</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF3263']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryButtonText}>Start Creating</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  gradient: {
    flex: 1,
  },
  circlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.08,
  },
  circle1: {
    width: 350,
    height: 350,
    backgroundColor: '#FF6B9D',
    top: -150,
    right: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    backgroundColor: '#C06C84',
    bottom: -50,
    left: -80,
  },
  circle3: {
    width: 180,
    height: 180,
    backgroundColor: '#6C5B7B',
    top: 150,
    left: -50,
  },
  circle4: {
    width: 200,
    height: 200,
    backgroundColor: '#FF8FAB',
    bottom: 200,
    right: -60,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 50,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  iconBox: {
    alignItems: 'center',
    gap: 12,
  },
  iconGradient: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  iconLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  bottomSection: {
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleAccentGradient: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  titleAccent: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  featureList: {
    gap: 12,
    marginTop: 8,
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.85,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF3263',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
