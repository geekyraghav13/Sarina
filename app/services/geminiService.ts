/**
 * Google Gemini API Service for AI Chat
 * Calls the backend proxy — Gemini API key is never shipped to the client.
 */

import { Girlfriend } from '../store/girlfriendStore';
import { getIdToken } from './authService';

const BACKEND_URL = 'https://sarina-voice-backend-1051121433445.us-central1.run.app';

interface ChatHistoryItem {
  sender: string;
  text: string;
}

/**
 * Generate AI response using backend Gemini proxy
 */
export const generateAIResponse = async (
  userMessage: string,
  character: Girlfriend,
  chatHistory: ChatHistoryItem[] = [],
  userName: string = 'You'
): Promise<string> => {
  try {
    const token = await getIdToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: userMessage,
        characterProfile: character,
        chatHistory: chatHistory.slice(-10),
        userName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Chat API Error:', errorData);
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error generating AI response:', error);

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
    friendly: [
      `Hey! Great to see you! How's your day going? 😊`,
      `Hi there! I'm so glad you're here! What's up? 🌟`,
      `Hello! Ready for a good conversation? 💬`,
    ],
    cheerful: [
      `Heyyyy! Ready to have a great chat? 😄`,
      `Hi! Let's talk and have some fun! 🎉`,
      `Well well, look who showed up! 😜`,
    ],
    caring: [
      `Hi there! How are you feeling today? I'm here for you 💙`,
      `Hello! I hope you're doing well. Want to talk? 🤗`,
      `Hey! Tell me how you're doing... I'm all ears 💕`,
    ],
    supportive: [
      `Hi! I'm so happy to see you 💕`,
      `Hey there! How can I brighten your day? 🌹`,
      `Finally, you're here! I'm here to support you 💖`,
    ],
  };

  const tone = character.tone[0]?.toLowerCase() || 'friendly';
  const messages = welcomeMessages[tone] || welcomeMessages.friendly;

  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Check if chat service is available (always true — backend handles auth)
 */
export const isGeminiConfigured = (): boolean => true;

// Export as isOpenRouterConfigured for backward compatibility
export const isOpenRouterConfigured = isGeminiConfigured;
