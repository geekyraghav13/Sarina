import { create } from 'zustand';
import {
  fetchCharactersWithRetry,
  getFallbackCharacters
} from '../services/firebaseService';
import {
  loadChatHistories,
  saveChatHistories,
} from './chatPersistence';

export interface Girlfriend {
  id: string;
  name: string;
  tagline: string;
  appearance: string;
  personality: string[];
  interests: string[];
  tone: string[];
  imageUrl?: string;
  videoPath?: any; // Local video source
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface GirlfriendStore {
  selectedGirlfriend: Girlfriend | null;
  girlfriends: Girlfriend[];
  chatHistories: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
  setSelectedGirlfriend: (girlfriend: Girlfriend) => void;
  initializeDefaultGirlfriend: () => void;
  addMessage: (girlfriendId: string, message: Message) => void;
  getChatHistory: (girlfriendId: string) => Message[];
  loadGirlfriends: () => Promise<void>;
  retryLoadGirlfriends: () => Promise<void>;
  loadChatHistoriesFromStorage: () => Promise<void>;
  clearAllChats: () => Promise<void>;
  deleteConversation: (girlfriendId: string) => Promise<void>;
}

// Default girlfriend from onboarding
const createDefaultGirlfriend = (): Girlfriend => ({
  id: 'default',
  name: 'Sarina',
  tagline: 'Your perfect companion ❤️',
  appearance: 'fantasy',
  personality: ['Kind', 'Supportive'],
  interests: ['Music', 'Art'],
  tone: ['Romantic', 'Caring'],
  videoPath: require('../../assets/videos/fantasy.mp4'),
});

// Future: Add more girlfriends
const mockGirlfriends: Girlfriend[] = [
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

export const useGirlfriendStore = create<GirlfriendStore>((set, get) => ({
  selectedGirlfriend: null,
  girlfriends: mockGirlfriends,
  chatHistories: {},
  isLoading: false,
  error: null,

  setSelectedGirlfriend: (girlfriend: Girlfriend) => {
    set({ selectedGirlfriend: girlfriend });
  },

  initializeDefaultGirlfriend: () => {
    const defaultGirlfriend = createDefaultGirlfriend();
    const { girlfriends, chatHistories } = get();

    // Add default girlfriend to girlfriends list if not already present
    const existingDefault = girlfriends.find(gf => gf.id === 'default');
    if (!existingDefault) {
      set({ girlfriends: [defaultGirlfriend, ...girlfriends] });
    }

    set({ selectedGirlfriend: defaultGirlfriend });

    // Initialize chat history with welcome message if not exists
    if (!chatHistories[defaultGirlfriend.id]) {
      set({
        chatHistories: {
          ...chatHistories,
          [defaultGirlfriend.id]: [
            {
              id: '1',
              text: `Hi! I'm so excited to chat with you! 💕`,
              sender: defaultGirlfriend.name,
              timestamp: new Date(),
            },
          ],
        },
      });
    }
  },

  addMessage: (girlfriendId: string, message: Message) => {
    const { chatHistories } = get();
    const currentHistory = chatHistories[girlfriendId] || [];
    const updatedHistories = {
      ...chatHistories,
      [girlfriendId]: [...currentHistory, message],
    };

    set({ chatHistories: updatedHistories });

    // Save to AsyncStorage asynchronously
    saveChatHistories(updatedHistories).catch((error) => {
      console.error('Failed to persist chat message:', error);
    });
  },

  getChatHistory: (girlfriendId: string) => {
    const { chatHistories } = get();
    return chatHistories[girlfriendId] || [];
  },

  loadGirlfriends: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log('Loading girlfriends from Firebase...');
      const firebaseGirlfriends = await fetchCharactersWithRetry(3, 2000);

      if (firebaseGirlfriends.length > 0) {
        console.log(`Loaded ${firebaseGirlfriends.length} girlfriends from Firebase`);
        set({ girlfriends: firebaseGirlfriends, isLoading: false, error: null });
      } else {
        // If no characters from Firebase, use fallback
        console.warn('No characters from Firebase, using fallback');
        const fallbackGirlfriends = getFallbackCharacters();
        set({
          girlfriends: fallbackGirlfriends,
          isLoading: false,
          error: 'Using local characters',
        });
      }
    } catch (error) {
      console.error('Failed to load girlfriends:', error);
      // Use fallback characters on error
      const fallbackGirlfriends = getFallbackCharacters();
      set({
        girlfriends: fallbackGirlfriends,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load characters',
      });
    }
  },

  retryLoadGirlfriends: async () => {
    console.log('Retrying to load girlfriends...');
    await get().loadGirlfriends();
  },

  loadChatHistoriesFromStorage: async () => {
    try {
      console.log('📖 Loading chat histories from storage...');
      const savedHistories = await loadChatHistories();

      if (Object.keys(savedHistories).length > 0) {
        set({ chatHistories: savedHistories });
        console.log(`✅ Loaded ${Object.keys(savedHistories).length} chat histories`);
      }
    } catch (error) {
      console.error('Failed to load chat histories:', error);
    }
  },

  clearAllChats: async () => {
    try {
      set({ chatHistories: {} });
      await saveChatHistories({});
      console.log('🗑️ All chats cleared');
    } catch (error) {
      console.error('Failed to clear chats:', error);
    }
  },

  deleteConversation: async (girlfriendId: string) => {
    try {
      const { chatHistories } = get();
      const updatedHistories = { ...chatHistories };
      delete updatedHistories[girlfriendId];

      set({ chatHistories: updatedHistories });
      await saveChatHistories(updatedHistories);
      console.log(`🗑️ Deleted conversation for ${girlfriendId}`);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  },
}));
