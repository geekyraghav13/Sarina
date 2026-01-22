import { Girlfriend } from '../store/girlfriendStore';

/**
 * Firebase Service for fetching girlfriend characters using REST API
 */

// Character data interface matching Firebase Remote Config
export interface FirebaseCharacter {
  id: string;
  name: string;
  tagline: string;
  bio?: string;
  appearance: string;
  personality: string[];
  interests: string[];
  tone: string[];
  imageUrl: string; // Firebase Storage URL
}

// Firebase project details
const FIREBASE_PROJECT_ID = 'sarina-ai-2b2c1';
const FIREBASE_API_KEY = 'AIzaSyCoso8vP9ZY6fCGq3g-bgOyEdLDja9Dyo0';

/**
 * Fetch characters from Firebase Remote Config using client SDK endpoint
 * This works in React Native without requiring native modules
 * @returns Array of girlfriend characters
 */
export const fetchCharactersFromRemoteConfig = async (): Promise<Girlfriend[]> => {
  try {
    console.log('Fetching characters from Firebase Remote Config via REST API...');

    // Use the namespaced config fetch endpoint with API key
    const url = `https://firebaseremoteconfig.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/namespaces/firebase:fetch?key=${FIREBASE_API_KEY}`;

    // Fetch from Firebase REST API with app instance info
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: '1:1051121433445:web:b3d60bb5ea0190e09c7f8c',
        appInstanceId: 'default-instance',
        appInstanceIdToken: '',
        countryCode: 'US',
        languageCode: 'en',
        platformVersion: '1.0.0',
        timeZone: 'America/New_York',
        packageName: 'com.sarina.app',
        sdkVersion: '9.0.0',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firebase API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Remote Config fetched successfully');

    // Extract entries (parameters)
    const entries = data.entries || {};
    const charactersValue = entries.characters;

    if (!charactersValue) {
      console.warn('No characters parameter found in Remote Config');
      return [];
    }

    // Decode base64 if needed, or use value directly
    let charactersJson = charactersValue;

    // If it's base64 encoded, decode it
    if (typeof charactersValue === 'string' && charactersValue.length > 0) {
      try {
        // Try to parse as base64
        charactersJson = atob(charactersValue);
      } catch {
        // If not base64, use as-is
        charactersJson = charactersValue;
      }
    }

    console.log('Characters JSON length:', charactersJson.length);

    // Parse JSON
    if (!charactersJson || charactersJson === '[]' || charactersJson.length === 0) {
      console.warn('No characters found in Remote Config');
      return [];
    }

    const characters: FirebaseCharacter[] = JSON.parse(charactersJson);

    // Map to Girlfriend interface
    const girlfriends: Girlfriend[] = characters.map((char) => ({
      id: char.id,
      name: char.name,
      tagline: char.tagline,
      appearance: char.appearance,
      personality: char.personality || [],
      interests: char.interests || [],
      tone: char.tone || [],
      imageUrl: char.imageUrl,
    }));

    console.log(`Successfully loaded ${girlfriends.length} characters from Firebase`);
    return girlfriends;
  } catch (error) {
    console.error('Error fetching characters from Remote Config:', error);
    throw new Error(
      `Failed to fetch characters: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Get fallback characters (used when Remote Config fails)
 * These are the original mock characters
 */
export const getFallbackCharacters = (): Girlfriend[] => {
  return [
    {
      id: '1',
      name: 'Serena',
      tagline: 'Loves deep talks ❤️',
      appearance: 'realistic',
      personality: ['Intelligent', 'Empathetic'],
      interests: ['Reading', 'Philosophy'],
      tone: ['Thoughtful', 'Caring'],
      videoPath: require('../../assets/videos/default.mp4'),
    },
    {
      id: '2',
      name: 'Maya',
      tagline: 'Playful and fun 💕',
      appearance: 'anime',
      personality: ['Funny', 'Adventurous'],
      interests: ['Gaming', 'Movies'],
      tone: ['Playful', 'Flirty'],
      videoPath: require('../../assets/videos/anime.mp4'),
    },
    {
      id: '3',
      name: 'Luna',
      tagline: 'Mysterious and enchanting 🌙',
      appearance: 'fantasy',
      personality: ['Creative', 'Bold'],
      interests: ['Art', 'Music'],
      tone: ['Mysterious', 'Romantic'],
      videoPath: require('../../assets/videos/fantasy.mp4'),
    },
    {
      id: '4',
      name: 'Sophie',
      tagline: 'Sweet and caring 💖',
      appearance: 'minimal',
      personality: ['Kind', 'Supportive'],
      interests: ['Cooking', 'Photography'],
      tone: ['Caring', 'Friendly'],
      videoPath: require('../../assets/videos/minimal.mp4'),
    },
  ];
};

/**
 * Retry mechanism for fetching characters
 * @param maxRetries Maximum number of retry attempts
 * @param retryDelay Delay between retries in milliseconds
 */
export const fetchCharactersWithRetry = async (
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<Girlfriend[]> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt}/${maxRetries}`);
      const characters = await fetchCharactersFromRemoteConfig();

      // If we got characters, return them
      if (characters.length > 0) {
        return characters;
      }

      // If empty, continue to retry
      console.warn(`Attempt ${attempt}: Got empty characters array`);
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        console.log(`Waiting ${retryDelay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  // All retries failed, throw error
  throw new Error(
    `Failed to fetch characters after ${maxRetries} attempts: ${
      lastError?.message || 'Unknown error'
    }`
  );
};
