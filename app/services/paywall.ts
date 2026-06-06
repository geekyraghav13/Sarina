/**
 * Present the RevenueCat subscription paywall (Play Billing). Lazy-requires the
 * native modules so callers stay Expo-Go-safe (import this only, call when tapped).
 *
 * The offering is resolved from the REVENUECAT_PAYWALL_PLACEMENT_ID placement so
 * you can serve different paywalls per region / A-B test from the dashboard. If
 * the placement returns nothing (not configured for this user) we fall back to the
 * default "current" offering so subscribing is never blocked.
 *
 * Returns:
 *   true  — user is now premium (purchased/restored, confirmed)
 *   false — paywall shown but no purchase
 *   null  — paywall unavailable (e.g. Expo Go / not configured)
 */
export const presentPaywall = async (): Promise<boolean | null> => {
  try {
    const ENV = require('../config/env').default;
    const Purchases = require('react-native-purchases').default;
    const PurchasesUI = require('react-native-purchases-ui');
    const RevenueCatUI = PurchasesUI.default;
    const { PAYWALL_RESULT } = PurchasesUI;

    // Prefer the placement's offering; fall back to the default current offering.
    let offering = null;
    try {
      offering = await Purchases.getCurrentOfferingForPlacement(
        ENV.REVENUECAT_PAYWALL_PLACEMENT_ID
      );
    } catch (e: any) {
      console.warn('[paywall] placement lookup failed, using current offering:', e?.message);
    }

    const result = await RevenueCatUI.presentPaywall(offering ? { offering } : {});
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

/**
 * Present the voice-credit TOP-UP paywall via a RevenueCat Placement and, on a
 * successful purchase, grant the consumable's credits into the top-up bucket.
 *
 * The offering is resolved purely from the placement
 * (ENV.REVENUECAT_TOPUP_PLACEMENT_ID) — there is NO fallback offering, so if the
 * placement isn't configured/published we return null and the caller shows an
 * "unavailable" message (user simply waits for renewal).
 *
 * Returns:
 *   true  — purchased (or restored) and top-up credits granted
 *   false — paywall shown but no purchase (cancelled)
 *   null  — top-ups unavailable (placement not served / Expo Go / not configured)
 */
export const purchaseVoiceTopup = async (): Promise<boolean | null> => {
  try {
    const ENV = require('../config/env').default;
    const Purchases = require('react-native-purchases').default;
    const PurchasesUI = require('react-native-purchases-ui');
    const RevenueCatUI = PurchasesUI.default;
    const { PAYWALL_RESULT } = PurchasesUI;

    const offering = await Purchases.getCurrentOfferingForPlacement(
      ENV.REVENUECAT_TOPUP_PLACEMENT_ID
    );
    if (!offering) {
      console.warn('[paywall] no offering for placement:', ENV.REVENUECAT_TOPUP_PLACEMENT_ID);
      return null;
    }

    const result = await RevenueCatUI.presentPaywall({ offering });
    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
      try {
        await require('./revenueCatService').syncTopupPurchase();
        require('./firebaseAnalytics').logTopupPurchased(ENV.VOICE_TOPUP_SECONDS);
      } catch (e) {
        console.warn('[paywall] syncTopupPurchase failed:', e);
      }
      return true;
    }
    return false;
  } catch (e: any) {
    console.warn('[paywall] top-up unavailable:', e?.message);
    return null;
  }
};
