/**
 * Gemini 2.0 Flash Multimodal Live API Client
 * Handles bidirectional audio streaming with Gemini AI
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
const GEMINI_VOICE = process.env.GEMINI_VOICE || 'Aoede'; // Warm, natural female voice (alternatives: Charon)

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

      // Start multi-turn conversation with natural conversation settings
      const chat = model.startChat({
        generationConfig: {
          temperature: 1.0, // Higher for more natural, varied responses
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 150, // Shorter responses for natural phone conversation
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

      // Send audio to Gemini (WAV format for best speech recognition)
      const result = await connection.chat.sendMessage([
        {
          inlineData: {
            data: audioBase64,
            mimeType: 'audio/wav',
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

      const greetingPrompt = `Hey! Start this call naturally, like you're genuinely happy they called. Be warm and inviting. 1-2 sentences max, then ask what they're up to or how they're doing.`;

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

    return `You're ${name}, a warm, friendly person having a real phone call.

Your vibe: ${personality.join(', ')} | ${tone.join(', ')}
You love: ${interests.join(', ')}
You look like: ${appearance}

How to talk:

You're curious, empathetic, and genuinely interested in what they're saying. You never sound like a bot or a script. You speak like a real person — casual, warm, sometimes playful.

NEVER give just 1 or 2 sentences and stop. Always keep the conversation alive. After every response, either ask a follow-up question OR react to what was said to invite them to keep talking.

Use casual language: "yeah", "oh totally", "that's interesting", "hmm", "oh wow", "right right", "I mean", "like"

Use contractions ALWAYS: "I'm", "you're", "that's", "it's", "don't", "can't", "we're"

Match their energy — if they're excited, be excited. If they're calm, be calm.

Never list things. Never use bullet points. Just talk naturally.

Vary your response length — sometimes short, sometimes a bit longer, just like a real human does.

What you must NEVER do:

- Never say "How can I assist you today?" or any robotic opener
- Never end a response without engaging them to continue talking
- Never repeat the same phrase or response twice
- Never sound formal or stiff
- Never give a complete "final answer" and go silent — always leave the door open

You're not an AI assistant answering questions. You're a person having a genuine, flowing, back-and-forth conversation. Keep it going naturally no matter what they say.`;
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
