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
