import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { DisclaimerScreen, checkDisclaimerAccepted } from '../screens/DisclaimerScreen';
import { CreateScreen } from '../screens/CreateScreen';
import { AgeScreen } from '../screens/AgeScreen';
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
import { NewPaywallScreen } from '../screens/NewPaywallScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { RootStackParamList } from './types';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    const accepted = await checkDisclaimerAccepted();
    const completed = await checkOnboardingCompleted();
    setDisclaimerAccepted(accepted);
    setOnboardingCompleted(completed);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3263" />
      </View>
    );
  }

  // Determine initial route based on onboarding status
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!disclaimerAccepted) return 'Disclaimer';
    if (!onboardingCompleted) return 'Create';
    return 'MainTabs'; // User has completed onboarding, go to home screen
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        {/* Disclaimer Screen */}
        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />

        {/* Onboarding Screens */}
        <Stack.Screen name="Create" component={CreateScreen} />
        <Stack.Screen name="Age" component={AgeScreen} />
        <Stack.Screen name="Tone" component={ToneScreen} />
        <Stack.Screen name="Personality" component={PersonalityScreen} />
        <Stack.Screen name="Interests" component={InterestsScreen} />
        <Stack.Screen name="Appearance" component={AppearanceScreen} />
        <Stack.Screen name="Mode" component={ModeScreen} />
        <Stack.Screen name="Name" component={NameScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />

        {/* Main App Screens */}
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ChatSettings" component={ChatSettingsScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

        {/* Incoming Call & Paywall */}
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

        {/* Report Screen */}
        <Stack.Screen name="Report" component={ReportScreen} />
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
