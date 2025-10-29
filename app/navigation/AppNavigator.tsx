import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { CreateScreen } from '../screens/CreateScreen';
import { AgeScreen } from '../screens/AgeScreen';
import { ToneScreen } from '../screens/ToneScreen';
import { PersonalityScreen } from '../screens/PersonalityScreen';
import { InterestsScreen } from '../screens/InterestsScreen';
import { AppearanceScreen } from '../screens/AppearanceScreen';
import { ModeScreen } from '../screens/ModeScreen';
import { NameScreen } from '../screens/NameScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Create"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="Create" component={CreateScreen} />
        <Stack.Screen name="Age" component={AgeScreen} />
        <Stack.Screen name="Tone" component={ToneScreen} />
        <Stack.Screen name="Personality" component={PersonalityScreen} />
        <Stack.Screen name="Interests" component={InterestsScreen} />
        <Stack.Screen name="Appearance" component={AppearanceScreen} />
        <Stack.Screen name="Mode" component={ModeScreen} />
        <Stack.Screen name="Name" component={NameScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
