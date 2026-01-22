import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from './girlfriendStore';

/**
 * Chat Persistence Service using AsyncStorage
 * Saves and loads chat histories for each character
 */

const CHAT_STORAGE_KEY = '@sarina_chat_histories';

/**
 * Save all chat histories to AsyncStorage
 */
export const saveChatHistories = async (
  chatHistories: Record<string, Message[]>
): Promise<void> => {
  try {
    // Convert Date objects to ISO strings for storage
    const serializedHistories: Record<string, any[]> = {};

    Object.keys(chatHistories).forEach((characterId) => {
      serializedHistories[characterId] = chatHistories[characterId].map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));
    });

    const jsonValue = JSON.stringify(serializedHistories);
    await AsyncStorage.setItem(CHAT_STORAGE_KEY, jsonValue);

    console.log('💾 Chat histories saved to storage');
  } catch (error) {
    console.error('Error saving chat histories:', error);
  }
};

/**
 * Load all chat histories from AsyncStorage
 */
export const loadChatHistories = async (): Promise<Record<string, Message[]>> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CHAT_STORAGE_KEY);

    if (jsonValue === null) {
      console.log('📭 No saved chat histories found');
      return {};
    }

    const serializedHistories = JSON.parse(jsonValue);

    // Convert ISO strings back to Date objects
    const chatHistories: Record<string, Message[]> = {};

    Object.keys(serializedHistories).forEach((characterId) => {
      chatHistories[characterId] = serializedHistories[characterId].map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    });

    console.log(`📬 Loaded chat histories for ${Object.keys(chatHistories).length} characters`);
    return chatHistories;
  } catch (error) {
    console.error('Error loading chat histories:', error);
    return {};
  }
};

/**
 * Clear all chat histories from storage
 */
export const clearAllChatHistories = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
    console.log('🗑️ All chat histories cleared');
  } catch (error) {
    console.error('Error clearing chat histories:', error);
  }
};

/**
 * Save a single character's chat history
 */
export const saveSingleChatHistory = async (
  characterId: string,
  messages: Message[]
): Promise<void> => {
  try {
    // Load existing histories
    const allHistories = await loadChatHistories();

    // Update with new messages
    allHistories[characterId] = messages;

    // Save back
    await saveChatHistories(allHistories);
  } catch (error) {
    console.error(`Error saving chat history for ${characterId}:`, error);
  }
};

/**
 * Get storage statistics
 */
export const getChatStorageStats = async (): Promise<{
  totalCharacters: number;
  totalMessages: number;
  storageSize: string;
}> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CHAT_STORAGE_KEY);

    if (!jsonValue) {
      return { totalCharacters: 0, totalMessages: 0, storageSize: '0 KB' };
    }

    const histories = JSON.parse(jsonValue);
    const totalCharacters = Object.keys(histories).length;
    let totalMessages = 0;

    Object.values(histories).forEach((messages: any) => {
      totalMessages += messages.length;
    });

    const storageSizeKB = (jsonValue.length / 1024).toFixed(2);

    return {
      totalCharacters,
      totalMessages,
      storageSize: `${storageSizeKB} KB`,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { totalCharacters: 0, totalMessages: 0, storageSize: '0 KB' };
  }
};
