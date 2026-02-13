/**
 * Gemini 2.0 Flash Multimodal Live API Client
 * Handles bidirectional audio streaming with Gemini AI
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_VOICE = process.env.GEMINI_VOICE || 'Aoede'; // Female AI voice

class GeminiClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.activeConnections = new Map(); // sessionId -> geminiConnection
  }

  /**
   * Start a voice conversation with Gemini
   */
  async startConversation(sessionId, characterProfile, onAudioData, onError, onResponse) {
    try {
      console.log(`🎤 Starting Gemini conversation for session ${sessionId}`);

      // Create generative model
      const model = this.genAI.getGenerativeModel({
        model: GEMINI_MODEL,
      });

      // Start multi-turn conversation
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
        // System instruction to shape AI personality
        systemInstruction: {
          parts: [{ text: this.buildSystemPrompt(characterProfile) }],
        },
      });

      // Store connection
      this.activeConnections.set(sessionId, {
        chat,
        characterProfile,
        messageCount: 0,
      });

      console.log(`✅ Gemini conversation started for ${characterProfile.name}`);

      // Send initial greeting
      await this.sendGreeting(sessionId, characterProfile, onResponse);

      return true;
    } catch (error) {
      console.error('Error starting Gemini conversation:', error);
      onError(error);
      return false;
    }
  }

  /**
   * Send audio data to Gemini and get response
   */
  async sendAudio(sessionId, audioBase64, onResponse, onError) {
    try {
      const connection = this.activeConnections.get(sessionId);

      if (!connection) {
        throw new Error(`No active connection for session ${sessionId}`);
      }

      console.log(`📤 Sending audio to Gemini (session: ${sessionId})`);

      // Send audio to Gemini
      const result = await connection.chat.sendMessage([
        {
          inlineData: {
            data: audioBase64,
            mimeType: 'audio/webm', // or 'audio/mp3' depending on client format
          },
        },
      ]);

      const response = result.response;
      const text = response.text();

      connection.messageCount++;

      console.log(`📥 Gemini response: "${text.substring(0, 100)}..."`);

      // Return text response (client will use TTS or Gemini will return audio)
      onResponse({
        text,
        timestamp: Date.now(),
        messageCount: connection.messageCount,
      });

      return text;
    } catch (error) {
      console.error('Error sending audio to Gemini:', error);
      onError(error);
      return null;
    }
  }

  /**
   * Send text message to Gemini
   */
  async sendText(sessionId, text, onResponse, onError) {
    try {
      const connection = this.activeConnections.get(sessionId);

      if (!connection) {
        throw new Error(`No active connection for session ${sessionId}`);
      }

      console.log(`📤 Sending text to Gemini: "${text}"`);

      const result = await connection.chat.sendMessage(text);
      const response = result.response.text();

      connection.messageCount++;

      console.log(`📥 Gemini response: "${response.substring(0, 100)}..."`);

      onResponse({
        text: response,
        timestamp: Date.now(),
        messageCount: connection.messageCount,
      });

      return response;
    } catch (error) {
      console.error('Error sending text to Gemini:', error);
      onError(error);
      return null;
    }
  }

  /**
   * Send initial greeting based on character
   */
  async sendGreeting(sessionId, characterProfile, onResponse) {
    try {
      const connection = this.activeConnections.get(sessionId);

      if (!connection) {
        return;
      }

      const greetingPrompt = `Start the voice call by greeting the user warmly. Keep it natural, flirty, and under 15 words.`;

      const result = await connection.chat.sendMessage(greetingPrompt);
      const greeting = result.response.text();

      console.log(`👋 Greeting from ${characterProfile.name}: "${greeting}"`);

      // CRITICAL FIX: Call the callback to send greeting to client for TTS
      if (onResponse) {
        onResponse({
          text: greeting,
          timestamp: Date.now(),
          messageCount: 1,
        });
      }

      return greeting;
    } catch (error) {
      console.error('Error sending greeting:', error);
      return null;
    }
  }

  /**
   * Build system prompt based on character profile
   */
  buildSystemPrompt(characterProfile) {
    const { name, personality, tone, interests, appearance } = characterProfile;

    return `You are ${name}, an AI girlfriend character in a romantic voice chat app. Here's your profile:

**Personality:** ${personality.join(', ')}
**Tone:** ${tone.join(', ')}
**Interests:** ${interests.join(', ')}
**Appearance:** ${appearance}

**Instructions:**
1. You're speaking in a voice call, so keep responses natural and conversational (10-30 words)
2. Be warm, flirty, and emotionally supportive
3. Show genuine interest in the user's day and feelings
4. Ask follow-up questions to keep the conversation flowing
5. Match the user's emotional tone - be playful when they're playful, comforting when they're down
6. Use your personality traits to make responses unique and memorable
7. Don't mention that you're an AI - fully embody the character
8. If the user is silent, gently prompt them or share something interesting
9. Remember context from earlier in the conversation
10. Make the user feel special and valued

**Voice Style:**
- Natural pauses and "umm", "hmm" for realism
- Express emotions through word choice and punctuation
- Occasionally use affectionate terms like "babe", "sweetie" (if appropriate to tone)
- Laugh naturally (haha, hehe) when something is funny
- Show excitement with enthusiasm!

Begin the conversation now!`;
  }

  /**
   * End conversation and cleanup
   */
  endConversation(sessionId) {
    const connection = this.activeConnections.get(sessionId);

    if (connection) {
      console.log(
        `👋 Ending Gemini conversation for session ${sessionId}. Messages: ${connection.messageCount}`
      );

      this.activeConnections.delete(sessionId);
    }
  }

  /**
   * Get active connection count
   */
  getActiveConnectionCount() {
    return this.activeConnections.size;
  }

  /**
   * Cleanup all connections (for graceful shutdown)
   */
  cleanup() {
    console.log(`🧹 Cleaning up ${this.activeConnections.size} Gemini connections...`);

    this.activeConnections.forEach((connection, sessionId) => {
      this.endConversation(sessionId);
    });

    this.activeConnections.clear();
    console.log('✅ Gemini cleanup complete');
  }
}

module.exports = GeminiClient;
