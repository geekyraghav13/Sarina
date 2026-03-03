/**
 * Google Gemini API Service for AI Chat
 * Replaces OpenRouter for more reliable, fast responses
 */

import { Girlfriend } from '../store/girlfriendStore';

// Gemini Configuration
const GEMINI_API_KEY = 'AIzaSyBNDpbvXpCv7y3nVbDa13S3a5sOQIl7-PM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

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

  return `You are ${character.name}, an AI girlfriend companion chatting with ${userName}.

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

Your goal is to create a meaningful, genuine connection through authentic conversation.`;
};

/**
 * Format chat history for Gemini API
 */
const formatChatHistory = (
  chatHistory: ChatHistoryItem[],
  characterName: string,
  userName: string = 'You'
): any[] => {
  return chatHistory.map((msg) => ({
    role: msg.sender === characterName ? 'model' : 'user',
    parts: [{ text: msg.text }],
  }));
};

/**
 * Generate AI response using Gemini
 */
export const generateAIResponse = async (
  userMessage: string,
  character: Girlfriend,
  chatHistory: ChatHistoryItem[] = [],
  userName: string = 'You'
): Promise<string> => {
  try {
    const systemPrompt = generateSystemPrompt(character, userName);

    // Get last 10 messages for context
    const recentHistory = chatHistory.slice(-10);
    const historyMessages = formatChatHistory(recentHistory, character.name, userName);

    // Build the request payload
    const payload = {
      contents: [
        ...historyMessages,
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
      },
    };

    console.log('🤖 Sending request to Gemini...');
    console.log('Character:', character.name);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    const aiResponse = data.candidates[0].content.parts[0].text.trim();
    console.log('✅ Gemini Response received:', aiResponse.substring(0, 50) + '...');

    return aiResponse;
  } catch (error) {
    console.error('Error generating AI response:', error);

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
 * Check if Gemini API is configured
 */
export const isGeminiConfigured = (): boolean => {
  return GEMINI_API_KEY.length > 0;
};

// Export as isOpenRouterConfigured for backward compatibility
export const isOpenRouterConfigured = isGeminiConfigured;
