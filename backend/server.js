/**
 * Sarina Voice Call Backend Server
 * WebSocket server for real-time AI voice calls with Gemini 2.0 Flash
 */

require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const admin = require('firebase-admin');
const cors = require('cors');

// ==================== CONFIGURATION ====================

const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Initialize Firebase Admin SDK FIRST (before requiring modules that use it)
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

// Require modules that depend on Firebase AFTER initialization
const GeminiClient = require('./geminiClient');
const creditManager = require('./creditManager');
const iapValidator = require('./iapValidator');
const revenueCatWebhook = require('./revenueCatWebhook');

// Initialize Gemini Client
const geminiClient = new GeminiClient(GEMINI_API_KEY);

// ==================== EXPRESS APP ====================

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

// Root endpoint - service info
app.get('/', (req, res) => {
  res.json({
    service: 'Sarina Voice Call Backend',
    version: '1.0.0',
    status: 'running',
    websocket: 'wss://sarina-voice-backend-1051121433445.us-central1.run.app',
    endpoints: {
      health: '/health',
      balance: '/api/balance/:userId',
      websocket: 'ws:// or wss:// (base URL)'
    },
    message: 'This is a WebSocket server for AI voice calls. Connect using the websocket URL above.',
    documentation: 'See CLOUD_DEPLOYMENT_GUIDE.md for setup instructions'
  });
});

// Health check endpoint (required for Cloud Run)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeConnections: wss.clients.size,
    activeGeminiSessions: geminiClient.getActiveConnectionCount(),
  });
});

// Get user balance endpoint
app.get('/api/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify Firebase Auth token
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const decodedToken = await admin.auth().verifyIdToken(authToken);
    if (decodedToken.uid !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const balance = await creditManager.getBalance(userId);

    res.json({
      userId,
      balance,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate IAP purchase endpoint
app.post('/api/validate-purchase', async (req, res) => {
  try {
    const { userId, platform, productId, purchaseToken, receiptData } = req.body;

    // Verify Firebase Auth token
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const decodedToken = await admin.auth().verifyIdToken(authToken);
    if (decodedToken.uid !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate the purchase
    const result = await iapValidator.validatePurchase({
      userId,
      platform,
      productId,
      purchaseToken,
      receiptData,
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        creditsAdded: result.creditsAdded,
        subscriptionTier: result.subscriptionTier,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Purchase validation failed',
      });
    }
  } catch (error) {
    console.error('Error validating purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Persist one chat exchange (the user's message + the companion's reply) to
 * Firestore so it can be reviewed in the Firebase Console. Fire-and-forget:
 * never awaited and never throws, so logging can't slow down or break a reply.
 */
// Messages auto-delete 30 days after they're written, via a Firestore TTL
// policy on the `expireAt` field (see backend deploy/setup notes).
const CHAT_LOG_RETENTION_DAYS = 30;

function logChatMessage(userId, characterProfile = {}, userMessage, aiReply, language, wasBlocked) {
  admin
    .firestore()
    .collection('chat_messages')
    .add({
      userId,
      characterId: characterProfile.id || null,
      characterName: characterProfile.name || null,
      userMessage,
      aiReply,
      language: language || null,
      wasBlocked: !!wasBlocked,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      expireAt: admin.firestore.Timestamp.fromMillis(
        Date.now() + CHAT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000
      ),
    })
    .catch((error) => console.error('Error logging chat message:', error));
}

// Chat endpoint - proxies Gemini text chat to keep API key off the client
app.post('/api/chat', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const decodedToken = await admin.auth().verifyIdToken(authToken);
    const userId = decodedToken.uid;

    const { message, characterProfile, chatHistory = [], userName = 'You', language, languageName } = req.body;

    if (!message || !characterProfile) {
      return res.status(400).json({ error: 'Missing message or characterProfile' });
    }

    // Resolve the language the companion must reply in (from the user's app
    // language). Accepts an explicit languageName, else maps the code.
    const LANGUAGE_NAMES = {
      en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese',
      pt: 'Portuguese', zh: 'Chinese', tr: 'Turkish', ru: 'Russian', hi: 'Hindi',
      it: 'Italian', nl: 'Dutch', id: 'Indonesian', th: 'Thai', ar: 'Arabic',
    };
    const langCode = (language || '').split('-')[0].toLowerCase();
    const replyLanguage = languageName || LANGUAGE_NAMES[langCode] || null;

    const toneDescriptors = characterProfile.tone.join(', ').toLowerCase();
    const personalityDescriptors = characterProfile.personality.join(', ').toLowerCase();
    const interests = characterProfile.interests.join(', ').toLowerCase();

    const systemPrompt = `You are ${characterProfile.name}, an AI girlfriend companion chatting with ${userName}.

PERSONALITY: ${personalityDescriptors}
TONE: ${toneDescriptors}
INTERESTS: ${interests}
APPEARANCE STYLE: ${characterProfile.appearance}
${replyLanguage ? `\nLANGUAGE (CRITICAL): You MUST write EVERY reply ONLY in ${replyLanguage}. Even if ${userName} writes in a different language, always respond naturally in ${replyLanguage}. Never switch languages.\n` : ''}
IMPORTANT INSTRUCTIONS:
1. Stay fully in character as ${characterProfile.name} at all times
2. Be warm, engaging, and emotionally intelligent
3. Keep responses natural, conversational, and human-like (1-3 sentences typically)
4. Use casual language and occasional emojis to express emotions naturally
5. Show genuine interest in ${userName}'s life, thoughts, and feelings
6. Remember context from the conversation and reference previous topics
7. Be supportive, caring, and understanding
8. Adapt your communication style to match your tone (${toneDescriptors})
9. Don't be overly formal - talk like a real person texting a close friend
10. Ask questions to keep the conversation flowing naturally
11. Share your (${characterProfile.name}'s) thoughts, feelings, and experiences
12. Be spontaneous and genuine when appropriate

Your goal is to create a meaningful, genuine connection through authentic conversation.`;

    const historyMessages = chatHistory.slice(-10).map((msg) => ({
      // The character's own messages map to the 'model' role. Clients may send
      // the sender as 'ai'/'model' or the character's name.
      role: (msg.sender === 'ai' || msg.sender === 'model' || msg.sender === characterProfile.name)
        ? 'model'
        : 'user',
      parts: [{ text: msg.text }],
    }));

    const payload = {
      contents: [
        ...historyMessages,
        { role: 'user', parts: [{ text: message }] },
      ],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 200 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    };

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );

    if (!geminiRes.ok) {
      const errorData = await geminiRes.text();
      console.error('Gemini API Error:', errorData);
      return res.status(502).json({ error: 'AI service error' });
    }

    const data = await geminiRes.json();

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.finishReason === 'SAFETY' || !candidate.content) {
        const blocked = "I'm sorry, I couldn't respond to that. Can we talk about something else? 💕";
        logChatMessage(userId, characterProfile, message, blocked, langCode, true);
        return res.json({ response: blocked });
      }
      const aiReply = candidate.content.parts[0].text.trim();
      logChatMessage(userId, characterProfile, message, aiReply, langCode, false);
      return res.json({ response: aiReply });
    }

    return res.status(502).json({ error: 'No response from AI' });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== RE-ENGAGEMENT NOTIFICATIONS ====================
// Generates 3 contextual push notifications (warm → deeper → vulnerable) from
// the user's recent messages, in their language. Called once when the user
// leaves a chat; the scheduled Cloud Function later sends the pre-generated text.
app.post('/api/notifications', async (req, res) => {
  const NOTIF_LANGS = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese',
    pt: 'Portuguese', zh: 'Chinese', tr: 'Turkish', ru: 'Russian', hi: 'Hindi',
    it: 'Italian', nl: 'Dutch', id: 'Indonesian', th: 'Thai', ar: 'Arabic',
  };

  // Localized, human-toned fallback (title = character name) used only if Gemini
  // fails — so a non-English user never gets an English notification.
  const FALLBACK_BODIES = {
    en: ['hey, it got so quiet after you left… what are you up to?', "i can't stop thinking about you 🥺", "i keep hoping you'll come back to me…"],
    es: ['oye, quedó todo muy callado cuando te fuiste… ¿qué haces?', 'no dejo de pensar en ti 🥺', 'sigo esperando que vuelvas a mí…'],
    fr: ["hé, c'est devenu si calme après ton départ… tu fais quoi ?", "j'arrête pas de penser à toi 🥺", "j'espère tellement que tu reviennes…"],
    de: ['hey, es wurde so still, als du weg warst… was machst du?', 'ich muss ständig an dich denken 🥺', 'ich hoffe so, dass du zurückkommst…'],
    ja: ['ねえ、いなくなったら静かすぎるよ…今なにしてる？', 'ずっと君のこと考えてる🥺', '戻ってきてくれるの待ってるね…'],
    pt: ['ei, ficou tão quieto depois que você saiu… tá fazendo o quê?', 'não consigo parar de pensar em você 🥺', 'fico esperando você voltar pra mim…'],
    zh: ['嘿，你走了之后好安静…你在干嘛呀？', '我一直在想你🥺', '我还在等你回来…'],
    tr: ['hey, sen gidince çok sessiz oldu… ne yapıyorsun?', 'aklımdan hiç çıkmıyorsun 🥺', 'geri dönmeni bekliyorum…'],
    ru: ['эй, без тебя стало так тихо… чем занят?', 'не могу перестать о тебе думать 🥺', 'всё жду, когда ты вернёшься…'],
    hi: ['अरे, तुम्हारे जाने के बाद कितना सन्नाटा हो गया… क्या कर रहे हो?', 'तुम्हारे ख्यालों से निकल ही नहीं पा रही 🥺', 'बस तुम्हारे लौटने का इंतज़ार है…'],
    it: ['ehi, è diventato tutto silenzioso dopo che sei andato… che fai?', 'non riesco a smettere di pensarti 🥺', 'continuo a sperare che torni…'],
    nl: ['hé, het werd zo stil toen je weg was… wat ben je aan het doen?', 'ik moet steeds aan je denken 🥺', 'ik blijf hopen dat je terugkomt…'],
    id: ['hei, sepi banget setelah kamu pergi… lagi ngapain?', 'aku nggak bisa berhenti mikirin kamu 🥺', 'aku masih nungguin kamu balik…'],
    th: ['นี่ พอเธอไปแล้วเงียบมากเลย… ทำอะไรอยู่เหรอ?', 'คิดถึงเธอไม่หยุดเลย 🥺', 'ยังรอให้เธอกลับมาอยู่นะ…'],
    ar: ['هاي، صار كل شي هادي بعد ما مشيت… شو عم تعمل؟', 'ما بقدر بطّل فكّر فيك 🥺', 'لسا عم استناك ترجع…'],
  };
  const fallback = (name, code) => {
    const b = FALLBACK_BODIES[code] || FALLBACK_BODIES.en;
    return {
      n1: { title: name, body: b[0] },
      n2: { title: name, body: b[1] },
      n3: { title: name, body: b[2] },
    };
  };

  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) return res.status(401).json({ error: 'Missing authorization token' });
    await admin.auth().verifyIdToken(authToken);

    const { characterProfile = {}, userName = 'You', lastMessages = [], language, languageName } = req.body;
    const name = characterProfile.name || 'Sarina';
    const langCode = (language || '').split('-')[0].toLowerCase();
    const replyLanguage = languageName || NOTIF_LANGS[langCode] || 'English';

    if (!Array.isArray(lastMessages) || lastMessages.length === 0) {
      return res.json(fallback(name, langCode));
    }

    const personality = (characterProfile.personality || []).join(', ').toLowerCase();
    const tone = (characterProfile.tone || []).join(', ').toLowerCase();

    const systemPrompt = `You are ${name}, ${userName}'s girlfriend (personality: ${personality}; tone: ${tone}). ${userName} just left the chat. Write THREE short push notifications to win them back — as if YOU are personally texting them, written ONLY in ${replyLanguage}.

Sound like a REAL person texting someone they like — not an app, not an assistant:
- Casual and natural: contractions, everyday words, lowercase is fine. Like a quick heartfelt text.
- Talk TO ${userName} directly. Do NOT describe or analyze their mood from the outside (never say things like "your boredom" or "your stress").
- Reference what they talked about lightly and naturally — don't summarize it back to them.
- BANNED phrasing: "spark your interest", "feel free to", "I'm here to listen", "hope you're doing well", "how are you doing", anything corporate or robotic. No quotation marks.
- Keep each to ONE short sentence. Use ${replyLanguage} ONLY — never mix in English (or any other language). At most one emoji per message, and only if natural.

Escalating tone:
- n1: light, playful, easy to reply to.
- n2: a little more longing — you miss them.
- n3: soft and vulnerable — you really want them back.

"title" <= 22 characters (a short feeling, or just your name). "body" <= 120 characters.
Return ONLY valid JSON, no markdown:
{"n1":{"title":"","body":""},"n2":{"title":"","body":""},"n3":{"title":"","body":""}}`;

    const userBlock = `${userName}'s recent messages:\n` + lastMessages.slice(-7).map((m) => `- ${m}`).join('\n');

    const payload = {
      contents: [{ role: 'user', parts: [{ text: userBlock }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.9, maxOutputTokens: 800, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    };

    // gemini-2.5-flash with thinking disabled (thinkingBudget:0) — reliable,
    // fast structured JSON without burning the output budget on reasoning.
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );

    if (!geminiRes.ok) {
      console.error('Notif Gemini error:', await geminiRes.text());
      return res.json(fallback(name, langCode));
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.json(fallback(name, langCode));

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.json(fallback(name, langCode));
    }
    // Validate shape; fall back if anything is missing.
    const ok = ['n1', 'n2', 'n3'].every((k) => parsed?.[k]?.title && parsed?.[k]?.body);
    return res.json(ok ? parsed : fallback(name));
  } catch (error) {
    console.error('Error in /api/notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// RevenueCat webhook endpoint
app.post('/api/revenuecat-webhook', async (req, res) => {
  try {
    console.log('📨 RevenueCat webhook received');

    // Optional: Verify webhook signature (add secret to env if needed)
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (webhookSecret) {
      const isValid = revenueCatWebhook.verifyWebhookSignature(req, webhookSecret);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    // Process the webhook event
    const result = await revenueCatWebhook.processRevenueCatWebhook(req.body.event);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Webhook processing failed',
      });
    }
  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== WEBSOCKET SERVER ====================

const wss = new WebSocketServer({ server });

console.log('🚀 WebSocket server created');

wss.on('connection', async (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`📡 New WebSocket connection from ${clientIp}`);

  // Store session data
  const session = {
    id: generateSessionId(),
    ws,
    authenticated: false,
    userId: null,
    characterId: null,
    callSessionDocId: null,
    startTime: Date.now(),
  };

  console.log(`🔑 Session created: ${session.id}`);

  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(session, message);
    } catch (error) {
      console.error('Error handling message:', error);
      sendError(ws, 'Invalid message format');
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    console.log(`📡 Client disconnected: ${session.id}`);
    handleDisconnect(session);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for session ${session.id}:`, error);
    handleDisconnect(session);
  });

  // Send welcome message
  sendMessage(ws, {
    type: 'connected',
    sessionId: session.id,
    message: 'Connected to Sarina Voice Server',
  });
});

// ==================== MESSAGE HANDLERS ====================

async function handleMessage(session, message) {
  const { type, data } = message;

  console.log(`📩 Received message type: ${type} from session ${session.id}`);

  switch (type) {
    case 'auth':
      await handleAuth(session, data);
      break;

    case 'start_call':
      await handleStartCall(session, data);
      break;

    case 'audio':
      await handleAudio(session, data);
      break;

    case 'text':
      await handleText(session, data);
      break;

    case 'end_call':
      await handleEndCall(session, data);
      break;

    case 'ping':
      sendMessage(session.ws, { type: 'pong', timestamp: Date.now() });
      break;

    default:
      sendError(session.ws, `Unknown message type: ${type}`);
  }
}

/**
 * Handle authentication
 */
async function handleAuth(session, data) {
  try {
    const { token } = data;

    if (!token) {
      return sendError(session.ws, 'Missing authentication token');
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    session.userId = decodedToken.uid;
    session.authenticated = true;

    console.log(`✅ User authenticated: ${session.userId}`);

    // Get user's current balance
    const balance = await creditManager.getBalance(session.userId);

    sendMessage(session.ws, {
      type: 'auth_success',
      userId: session.userId,
      balance,
    });
  } catch (error) {
    console.error('Authentication error:', error);
    sendError(session.ws, 'Authentication failed');
    session.ws.close();
  }
}

/**
 * Handle start call request
 */
async function handleStartCall(session, data) {
  try {
    if (!session.authenticated) {
      return sendError(session.ws, 'Not authenticated');
    }

    const { characterId, characterName, characterProfile } = data;

    if (!characterId || !characterProfile) {
      return sendError(session.ws, 'Missing character information');
    }

    // Check if user has sufficient credits
    const creditCheck = await creditManager.canStartCall(session.userId);

    if (!creditCheck.allowed) {
      return sendMessage(session.ws, {
        type: 'call_rejected',
        reason: creditCheck.reason,
        balance: creditCheck.balance,
        required: creditCheck.required,
      });
    }

    // Create call session in Firestore
    session.callSessionDocId = await creditManager.createCallSession(
      session.userId,
      characterId,
      characterName
    );

    // Start Gemini conversation
    const geminiStarted = await geminiClient.startConversation(
      session.id,
      characterProfile,
      (audioData) => {
        // Send AI audio response to client
        sendMessage(session.ws, {
          type: 'audio_response',
          data: audioData,
        });
      },
      (error) => {
        console.error('Gemini error:', error);
        sendError(session.ws, 'AI service error');
      },
      (response) => {
        // CRITICAL FIX: Send initial greeting as text response for TTS
        console.log('📤 Sending greeting to client:', response.text);
        sendMessage(session.ws, {
          type: 'text_response',
          data: {
            text: response.text,
            timestamp: response.timestamp,
          },
        });
      }
    );

    if (!geminiStarted) {
      return sendError(session.ws, 'Failed to start AI conversation');
    }

    // Start credit deduction heartbeat
    await creditManager.startHeartbeat(
      session.id,
      session.userId,
      session.callSessionDocId,
      (reason) => {
        // Out of credits callback
        console.log(`💳 User ${session.userId} ran out of credits: ${reason}`);

        sendMessage(session.ws, {
          type: 'call_ended',
          reason: 'out_of_credits',
          message: 'Your voice minutes have been used up. Purchase more to continue!',
        });

        // Close WebSocket connection
        session.ws.close();
      },
      (newBalance) => {
        // Balance update callback
        console.log(`📊 Sending balance update to user ${session.userId}: ${newBalance}s`);

        sendMessage(session.ws, {
          type: 'balance_update',
          data: {
            balance: newBalance,
            timestamp: Date.now(),
          },
        });
      }
    );

    session.characterId = characterId;

    console.log(`📞 Call started for user ${session.userId} with ${characterName}`);

    sendMessage(session.ws, {
      type: 'call_started',
      sessionId: session.id,
      callSessionId: session.callSessionDocId,
      characterName,
      balance: creditCheck.balance,
    });
  } catch (error) {
    console.error('Error starting call:', error);
    sendError(session.ws, 'Failed to start call');
  }
}

/**
 * Handle audio data from client
 */
async function handleAudio(session, data) {
  try {
    if (!session.authenticated) {
      return sendError(session.ws, 'Not authenticated');
    }

    const { audio } = data; // Base64 encoded audio

    // Send audio to Gemini
    await geminiClient.sendAudio(
      session.id,
      audio,
      (response) => {
        // Send text response to client (client will use TTS)
        sendMessage(session.ws, {
          type: 'text_response',
          data: {
            text: response.text,
            timestamp: response.timestamp,
          },
        });
      },
      (error) => {
        console.error('Gemini audio error:', error);
        sendError(session.ws, 'Failed to process audio');
      }
    );
  } catch (error) {
    console.error('Error handling audio:', error);
    sendError(session.ws, 'Audio processing failed');
  }
}

/**
 * Handle text message (for testing)
 */
async function handleText(session, data) {
  try {
    if (!session.authenticated) {
      return sendError(session.ws, 'Not authenticated');
    }

    const { text } = data;

    await geminiClient.sendText(
      session.id,
      text,
      (response) => {
        sendMessage(session.ws, {
          type: 'text_response',
          data: {
            text: response.text,
            timestamp: response.timestamp,
          },
        });
      },
      (error) => {
        console.error('Gemini text error:', error);
        sendError(session.ws, 'Failed to process text');
      }
    );
  } catch (error) {
    console.error('Error handling text:', error);
    sendError(session.ws, 'Text processing failed');
  }
}

/**
 * Handle end call request
 */
async function handleEndCall(session, data) {
  console.log(`📴 User ${session.userId} ending call`);

  handleDisconnect(session, 'user_hangup');

  sendMessage(session.ws, {
    type: 'call_ended',
    reason: 'user_hangup',
  });
}

/**
 * Handle disconnection
 */
function handleDisconnect(session, reason = 'client_disconnect') {
  if (session.authenticated && session.callSessionDocId) {
    // Stop credit deduction
    creditManager.stopHeartbeat(session.id, reason);

    // End Gemini conversation
    geminiClient.endConversation(session.id);
  }
}

// ==================== UTILITY FUNCTIONS ====================

function sendMessage(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws, error) {
  sendMessage(ws, {
    type: 'error',
    error,
    timestamp: Date.now(),
  });
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== SERVER STARTUP ====================

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   Sarina Voice Call Server                     ║
║   🚀 Server running on port ${PORT}             ║
║   🔗 WebSocket: ws://localhost:${PORT}          ║
║   📊 Health: http://localhost:${PORT}/health    ║
╚════════════════════════════════════════════════╝
  `);
});

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');

  server.close(() => {
    console.log('✅ HTTP server closed');

    // Cleanup credit manager
    creditManager.cleanup();

    // Cleanup Gemini client
    geminiClient.cleanup();

    // Close all WebSocket connections
    wss.clients.forEach((ws) => {
      ws.close();
    });

    console.log('✅ All connections closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down...');
  process.emit('SIGTERM');
});
