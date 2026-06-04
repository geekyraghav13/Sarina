/**
 * Present the RevenueCat paywall (Play Billing). Lazy-requires the native
 * modules so callers stay Expo-Go-safe (import this only, call when tapped).
 *
 * Returns:
 *   true  — user is now premium (purchased/restored, confirmed)
 *   false — paywall shown but no purchase
 *   null  — paywall unavailable (e.g. Expo Go / not configured)
 */
export const presentPaywall = async (): Promise<boolean | null> => {
  try {
    const PurchasesUI = require('react-native-purchases-ui');
    const RevenueCatUI = PurchasesUI.default;
    const { PAYWALL_RESULT } = PurchasesUI;

    const result = await RevenueCatUI.presentPaywall({});
    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
      try {
        return await require('./revenueCatService').checkPremiumStatus();
      } catch {
        return true;
      }
    }
    return false;
  } catch (e: any) {
    console.warn('[paywall] unavailable:', e?.message);
    return null;
  }
};
