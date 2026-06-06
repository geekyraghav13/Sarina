/**
 * Push notification client (expo-notifications, native).
 *
 * Responsible only for the device side: asking permission and getting the FCM
 * device token. The re-engagement scheduling lives in userEngagementService +
 * the Cloud Function. This module imports a native API, so callers should
 * lazy-require it (it must not load on the Expo Go preview path).
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Show notifications even when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Ask for permission (if needed) and return the FCM device push token, or null
 * if unavailable (simulator, denied, or not a device).
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    if (!Device.isDevice) return null;

    // Android: notifications need a channel to display.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    // FCM device token (Android) / APNs (iOS) — what the Cloud Function sends to.
    const token = await Notifications.getDevicePushTokenAsync();
    return (token?.data as string) || null;
  } catch (e) {
    console.warn('registerForPushNotifications failed:', e);
    return null;
  }
};

/**
 * Register a one-time handler for when the user taps a notification.
 * Returns an unsubscribe function.
 */
export const onNotificationTap = (
  handler: (data: Record<string, any>) => void
): (() => void) => {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    handler(response.notification.request.content.data || {});
  });
  return () => sub.remove();
};
