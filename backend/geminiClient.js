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
      console.log(`📏 Audio data size: ${audioBase64.length} characters`);

      // CRITICAL: Handle concatenated WAV chunks
      // expo-audio-stream sends multiple chunks, each with a WAV header
      // We need to merge them into a single valid WAV file
      const mergedAudio = this.mergeWavChunks(audioBase64);

      // Send merged WAV audio to Gemini (16kHz, 16-bit, mono WAV format)
      const result = await connection.chat.sendMessage([
        {
          inlineData: {
            data: mergedAudio,
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
   * Merge multiple WAV chunks into a single valid WAV file
   * expo-audio-stream sends concatenated WAV chunks with malformed headers
   */
  mergeWavChunks(audioBase64) {
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Check if this is a WAV file
    if (audioBuffer.toString('utf8', 0, 4) !== 'RIFF') {
      console.log('⚠️ Not a WAV file, sending as-is');
      return audioBase64;
    }

    // expo-audio-stream concatenates multiple WAV chunks
    // Each chunk has structure: RIFF header (12 bytes) + fmt chunk + data chunk
    // We need to extract ALL PCM data and rebuild ONE valid WAV file

    const pcmChunks = [];
    let fmtChunk = null;
    let offset = 0;

    // Find all WAV chunks by scanning for RIFF markers
    while (offset < audioBuffer.length - 11) {
      // Check if this is a RIFF header
      if (audioBuffer.toString('utf8', offset, offset + 4) === 'RIFF') {
        const chunkStart = offset;

        // Get the chunk size from RIFF header
        const riffChunkSize = audioBuffer.readUInt32LE(offset + 4);

        // Skip empty/invalid RIFF chunks
        if (riffChunkSize === 0 || riffChunkSize > audioBuffer.length) {
          console.log(`⚠️ Skipping invalid RIFF chunk (size=${riffChunkSize})`);
          offset += 12; // Skip just the RIFF header
          continue;
        }

        const chunkEnd = offset + 8 + riffChunkSize;

        // Skip RIFF header (12 bytes: "RIFF" + size + "WAVE")
        offset += 12;

        // Parse sub-chunks (fmt and data) within this RIFF chunk
        let foundData = false;
        while (offset < chunkEnd && offset < audioBuffer.length - 7 && !foundData) {
          const subChunkId = audioBuffer.toString('utf8', offset, offset + 4);
          const subChunkSize = audioBuffer.readUInt32LE(offset + 4);

          if (subChunkId === 'fmt ') {
            // Save the format chunk (only once)
            if (!fmtChunk) {
              fmtChunk = audioBuffer.slice(offset, offset + 8 + subChunkSize);
              console.log(`📋 Found fmt chunk: ${subChunkSize} bytes`);
            }
            offset += 8 + subChunkSize;
          } else if (subChunkId === 'data') {
            // Extract PCM data (skip size=0 chunks)
            if (subChunkSize > 0) {
              const pcmData = audioBuffer.slice(offset + 8, offset + 8 + subChunkSize);
              pcmChunks.push(pcmData);
              console.log(`📦 Found PCM data chunk: ${subChunkSize} bytes`);
            } else {
              console.log(`⚠️ Skipping empty data chunk (size=0)`);
            }
            offset += 8 + subChunkSize;
            foundData = true;
          } else {
            // Unknown chunk, skip it
            offset += 8 + subChunkSize;
          }
        }

        // Move to the end of this RIFF chunk to find the next one
        if (offset < chunkEnd) {
          offset = chunkEnd;
        }
      } else {
        // Not a RIFF header, move to next byte
        offset++;
      }
    }

    if (!fmtChunk) {
      console.error('❌ No valid fmt chunk found');
      return audioBase64;
    }

    if (pcmChunks.length === 0) {
      console.error('❌ No PCM data found');
      return audioBase64;
    }

    // Combine all PCM data
    const combinedPcm = Buffer.concat(pcmChunks);
    console.log(`✂️ Merged ${pcmChunks.length} WAV chunks: ${combinedPcm.length} bytes of PCM data`);

    // Build new WAV file: RIFF header + fmt chunk + data chunk
    const wavHeader = Buffer.alloc(12);
    wavHeader.write('RIFF', 0);
    wavHeader.writeUInt32LE(4 + fmtChunk.length + 8 + combinedPcm.length, 4); // File size
    wavHeader.write('WAVE', 8);

    const dataHeader = Buffer.alloc(8);
    dataHeader.write('data', 0);
    dataHeader.writeUInt32LE(combinedPcm.length, 4); // PCM data size

    const mergedWav = Buffer.concat([wavHeader, fmtChunk, dataHeader, combinedPcm]);
    const mergedBase64 = mergedWav.toString('base64');

    console.log(`✅ Built valid WAV: ${mergedWav.length} bytes (was ${audioBuffer.length} bytes)`);
    return mergedBase64;
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
