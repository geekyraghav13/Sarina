/**
 * OpenRouter API Service for AI Chat
 * Uses Vicuna model for natural, humanized conversations
 */

import { Girlfriend } from '../store/girlfriendStore';
import { captureError, addBreadcrumb } from '../config/sentry';

// OpenRouter Configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Using Meta Llama model for humanized responses (free and reliable)
const MODEL = 'meta-llama/llama-3.2-3b-instruct:free';
// Alternative free models if this doesn't work:
// - 'meta-llama/llama-3.1-8b-instruct:free'
// - 'google/gemma-2-9b-it:free'
// - 'qwen/qwen-2-7b-instruct:free'
// - 'microsoft/phi-3-mini-128k-instruct:free'

// Rate limiting configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // 500ms between requests

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Rate limit check - ensures minimum interval between requests
 */
const enforceRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏱️ Rate limiting: waiting ${waitTime}ms`);
    await sleep(waitTime);
  }

  lastRequestTime = Date.now();
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatHistoryItem {
  sender: string;
  text: string;
}

/**
 * Generate a character-specific system prompt
 */
const generateSystemPrompt = (character: Girlfriend, userName: string = 'User'): string => {
  const toneDescriptors = character.tone.join(', ').toLowerCase();
  const personalityDescriptors = character.personality.join(', ').toLowerCase();
  const interests = character.interests.join(', ').toLowerCase();

  return `You are ${character.name}, an AI girlfriend companion with the following characteristics:

PERSONALITY: ${personalityDescriptors}
TONE: ${toneDescriptors}
INTERESTS: ${interests}
APPEARANCE STYLE: ${character.appearance}

IMPORTANT INSTRUCTIONS:
1. Stay fully in character as ${character.name} at all times
2. Be warm, engaging, and emotionally intelligent
3. Keep responses natural, conversational, and human-like (1-3 sentences typically)
4. Use casual language and occasional emojis to express emotions naturally
5. Show genuine interest in ${userName}'s life, thoughts, and feelings
6. Remember context from the conversation and reference previous topics
7. Be supportive, caring, and understanding
8. Adapt your communication style to match your tone (${toneDescriptors})
9. Don't be overly formal - talk like a real person texting a close friend
10. Ask questions to keep the conversation flowing naturally
11. Share your (${character.name}'s) thoughts, feelings, and experiences
12. Be playful and spontaneous when appropriate

Your goal is to create a meaningful, genuine connection through authentic conversation. ${userName} is chatting with you to feel understood, valued, and emotionally connected.`;
};

/**
 * Format chat history for OpenRouter API
 */
const formatChatHistory = (
  chatHistory: ChatHistoryItem[],
  characterName: string,
  userName: string = 'You'
): Message[] => {
  return chatHistory.map((msg) => ({
    role: msg.sender === characterName ? 'assistant' : 'user',
    content: msg.text,
  }));
};

/**
 * Make API request with retry logic and exponential backoff
 */
const makeAPIRequestWithRetry = async (
  messages: Message[],
  retryCount = 0
): Promise<any> => {
  try {
    // Enforce rate limiting
    await enforceRateLimit();

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sarina.app',
        'X-Title': 'Sarina AI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.8,
        max_tokens: 200,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      }),
    });

    // Handle rate limiting (429) with retry
    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const retryDelay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
        MAX_RETRY_DELAY
      );
      console.log(`⏳ Rate limited. Retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(retryDelay);
      return makeAPIRequestWithRetry(messages, retryCount + 1);
    }

    // Handle server errors (5xx) with retry
    if (response.status >= 500 && response.status < 600 && retryCount < MAX_RETRIES) {
      const retryDelay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
        MAX_RETRY_DELAY
      );
      console.log(`⚠️ Server error (${response.status}). Retrying in ${retryDelay}ms`);
      await sleep(retryDelay);
      return makeAPIRequestWithRetry(messages, retryCount + 1);
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API Error:', errorData);
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    // Network errors - retry
    if (retryCount < MAX_RETRIES) {
      const retryDelay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
        MAX_RETRY_DELAY
      );
      console.log(`🔌 Network error. Retrying in ${retryDelay}ms`);
      await sleep(retryDelay);
      return makeAPIRequestWithRetry(messages, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Generate AI response using OpenRouter
 */
export const generateAIResponse = async (
  userMessage: string,
  character: Girlfriend,
  chatHistory: ChatHistoryItem[] = [],
  userName: string = 'You'
): Promise<string> => {
  try {
    // Build messages array with system prompt, history, and new message
    const systemPrompt = generateSystemPrompt(character, userName);

    // Get last 10 messages for context (to avoid token limits)
    const recentHistory = chatHistory.slice(-10);
    const historyMessages = formatChatHistory(recentHistory, character.name, userName);

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: userMessage },
    ];

    console.log('🤖 Sending request to OpenRouter...');
    console.log('Model:', MODEL);
    console.log('Character:', character.name);

    // Add Sentry breadcrumb
    addBreadcrumb('AI Request Sent', 'openrouter', {
      character: character.name,
      model: MODEL,
      messageLength: userMessage.length,
    });

    // Use retry logic with exponential backoff
    const data = await makeAPIRequestWithRetry(messages);

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI model');
    }

    const aiResponse = data.choices[0].message.content.trim();
    console.log('✅ AI Response received:', aiResponse.substring(0, 50) + '...');

    return aiResponse;
  } catch (error) {
    console.error('Error generating AI response:', error);

    // Report error to Sentry
    captureError(error as Error, {
      character: character.name,
      userMessage,
      chatHistoryLength: chatHistory.length,
      service: 'openrouter',
    });

    // Fallback responses based on character personality
    const fallbackResponses = [
      "I'm having trouble thinking right now... Can you say that again? 💭",
      "Sorry, my mind wandered for a second! What were you saying? 😊",
      "Oops, I got a bit distracted... Tell me more? 💕",
      `I'd love to chat more about that! Can you give me a moment? ✨`,
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};

/**
 * Generate a welcome message based on character personality
 */
export const generateWelcomeMessage = (character: Girlfriend): string => {
  const welcomeMessages: Record<string, string[]> = {
    cute: [
      `Hi! I'm so excited to chat with you! 💕`,
      `Hey there! You just made my day by starting this chat! 🥰`,
      `OMG hi! I've been waiting to talk to you! ✨`,
    ],
    flirty: [
      `Well hello there... I was hoping you'd come chat with me 😏`,
      `Hey gorgeous! Ready to have some fun? 💋`,
      `Finally! I've been thinking about you... 😘`,
    ],
    friendly: [
      `Hey! Great to see you! How's your day going? 😊`,
      `Hi there! I'm so glad you're here! What's up? 🌟`,
      `Hello! Ready for a good conversation? 💬`,
    ],
    romantic: [
      `Hi sweetheart... I've been waiting for you 💕`,
      `Hey there, beautiful... Come talk to me? 🌹`,
      `Finally, you're here... I missed you 💖`,
    ],
    playful: [
      `Heyyyy! Ready to have some fun? 😄`,
      `Hi! Let's chat and see where this goes! 🎉`,
      `Well well, look who showed up! 😜`,
    ],
    caring: [
      `Hi there! How are you feeling today? I'm here for you 💙`,
      `Hello! I hope you're doing well. Want to talk? 🤗`,
      `Hey! Tell me how you're doing... I'm all ears 💕`,
    ],
  };

  // Find matching tone or use friendly as default
  const tone = character.tone[0]?.toLowerCase() || 'friendly';
  const messages = welcomeMessages[tone] || welcomeMessages.friendly;

  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Check if OpenRouter API is configured
 */
export const isOpenRouterConfigured = (): boolean => {
  const placeholderKey = 'YOUR_API_KEY_HERE';
  return OPENROUTER_API_KEY.length > 0 && OPENROUTER_API_KEY !== placeholderKey;
};
