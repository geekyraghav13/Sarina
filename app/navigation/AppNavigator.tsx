import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { DisclaimerScreen, checkDisclaimerAccepted } from '../screens/DisclaimerScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { CreateScreen } from '../screens/CreateScreen';
import { LanguageSelectionScreen } from '../screens/LanguageSelectionScreen';
import { ToneScreen } from '../screens/ToneScreen';
import { PersonalityScreen } from '../screens/PersonalityScreen';
import { InterestsScreen } from '../screens/InterestsScreen';
import { AppearanceScreen } from '../screens/AppearanceScreen';
import { ModeScreen } from '../screens/ModeScreen';
import { NameScreen } from '../screens/NameScreen';
import { SummaryScreen, checkOnboardingCompleted } from '../screens/SummaryScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ChatSettingsScreen } from '../screens/ChatSettingsScreen';
import { IncomingCallScreen } from '../screens/IncomingCallScreen';
import { VoiceCallScreen } from '../screens/VoiceCallScreen';
import { NewPaywallScreen } from '../screens/NewPaywallScreen';
import { CustomCreditsPaywallScreen } from '../screens/CustomCreditsPaywallScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { RootStackParamList } from './types';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { onAuthStateChange, getCurrentUser } from '../services/authService';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadInitialRoute = async () => {
    const user = getCurrentUser();
    const authenticated = !!user;
    console.log('🔐 Current user:', authenticated ? user?.uid : 'Not signed in');

    // Check disclaimer acceptance regardless of auth status
    const accepted = await checkDisclaimerAccepted(user?.uid);
    console.log('📋 Disclaimer accepted:', accepted);
    setDisclaimerAccepted(accepted);

    if (authenticated) {
      const completed = await checkOnboardingCompleted(user?.uid);
      console.log('✏️ Onboarding completed:', completed);
      setOnboardingCompleted(completed);
    }

    setIsAuthenticated(authenticated);
    setIsInitialized(true);
    setIsLoading(false); // Auth check complete
    console.log('🧭 Navigation state updated - authenticated:', authenticated);
  };

  useEffect(() => {
    loadInitialRoute();

    // Poll for disclaimer acceptance every 500ms
    const disclaimerInterval = setInterval(async () => {
      if (!disclaimerAccepted) {
        const user = getCurrentUser();
        const accepted = await checkDisclaimerAccepted(user?.uid);
        if (accepted) {
          setDisclaimerAccepted(true);
        }
      }
    }, 500);

    // Poll for onboarding completion every 500ms
    const onboardingInterval = setInterval(async () => {
      if (isAuthenticated && disclaimerAccepted && !onboardingCompleted) {
        const user = getCurrentUser();
        const completed = await checkOnboardingCompleted(user?.uid);
        if (completed) {
          console.log('✅ Onboarding completion detected, updating navigation state');
          setOnboardingCompleted(true);
        }
      }
    }, 500);

    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // User signed in, update auth state but don't reload route
        // This prevents navigation interruption during onboarding
        console.log('🔐 Auth state changed - user signed in:', user.uid);
        setIsAuthenticated(true);
      } else {
        // User signed out
        setIsAuthenticated(false);
        setDisclaimerAccepted(false);
        setOnboardingCompleted(false);
      }
    });

    return () => {
      clearInterval(disclaimerInterval);
      clearInterval(onboardingInterval);
      unsubscribe();
    };
  }, [isAuthenticated, disclaimerAccepted, onboardingCompleted]);

  if (!isInitialized || isLoading) {
    // Show black screen while checking auth to prevent flash (no spinner)
    return (
      <View style={styles.loadingContainer}>
        {/* No loading indicator - just black screen to prevent flash */}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        {!disclaimerAccepted ? (
          // Disclaimer Stack - Show disclaimer if not accepted
          <>
            <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
            <Stack.Screen name="Create" component={CreateScreen} />
          </>
        ) : !onboardingCompleted ? (
          // Onboarding Stack - Show onboarding screens if not completed
          <>
            <Stack.Screen name="Create" component={CreateScreen} />
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="Personality" component={PersonalityScreen} />
            <Stack.Screen name="Interests" component={InterestsScreen} />
            <Stack.Screen name="Appearance" component={AppearanceScreen} />
            <Stack.Screen name="Mode" component={ModeScreen} />
            <Stack.Screen name="Tone" component={ToneScreen} />
            <Stack.Screen name="Name" component={NameScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Summary" component={SummaryScreen} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerLeft: () => null, // Disable back button during onboarding flow
                gestureEnabled: false, // Disable swipe back gesture
              }}
            />
            <Stack.Screen name="ChatSettings" component={ChatSettingsScreen} />
            <Stack.Screen
              name="IncomingCall"
              component={IncomingCallScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            />
            <Stack.Screen
              name="Paywall"
              component={NewPaywallScreen}
              options={{
                presentation: 'transparentModal',
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              }}
            />
            <Stack.Screen
              name="CustomCreditsPaywall"
              component={CustomCreditsPaywallScreen}
              options={{
                presentation: 'transparentModal',
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              }}
            />
            <Stack.Screen
              name="VoiceCall"
              component={VoiceCallScreen}
              options={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              }}
            />
          </>
        ) : (
          // Main App Stack - Show main app screens when everything is complete
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="ChatSettings" component={ChatSettingsScreen} />
            <Stack.Screen
              name="IncomingCall"
              component={IncomingCallScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            />
            <Stack.Screen
              name="VoiceCall"
              component={VoiceCallScreen}
              options={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              }}
            />
            <Stack.Screen
              name="Paywall"
              component={NewPaywallScreen}
              options={{
                presentation: 'transparentModal',
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              }}
            />
            <Stack.Screen
              name="CustomCreditsPaywall"
              component={CustomCreditsPaywallScreen}
              options={{
                presentation: 'transparentModal',
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              }}
            />
            <Stack.Screen name="Report" component={ReportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
