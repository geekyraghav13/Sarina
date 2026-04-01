/**
 * Voice Call Service
 * WebSocket client for real-time AI voice calls
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getIdToken } from './authService';

// Production WebSocket URL (Google Cloud Run)
const WS_URL = 'wss://sarina-voice-backend-1051121433445.us-central1.run.app';

// For local testing, use: 'ws://172.16.101.198:8080'

// TESTING MODE: Set to true to test without backend server
const MOCK_MODE = false;

export enum CallState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  AUTHENTICATING = 'authenticating',
  READY = 'ready',
  CALLING = 'calling',
  ERROR = 'error',
}

export interface VoiceCallHookReturn {
  state: CallState;
  balance: number | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  startCall: (characterId: string, characterName: string, characterProfile: any) => Promise<void>;
  endCall: () => void;
  sendAudio: (audioBase64: string) => void;
  sendText: (text: string) => void;
  onAudioResponse: ((audioData: any) => void) | null;
  onTextResponse: ((text: string) => void) | null;
  onCutOff: ((reason: string) => void) | null;
  setOnAudioResponse: (callback: (audioData: any) => void) => void;
  setOnTextResponse: (callback: (text: string) => void) => void;
  setOnCutOff: (callback: (reason: string) => void) => void;
}

/**
 * React Hook for managing WebSocket voice call
 */
export const useVoiceCall = (): VoiceCallHookReturn => {
  const [state, setState] = useState<CallState>(CallState.DISCONNECTED);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Callback refs
  const onAudioResponseRef = useRef<((audioData: any) => void) | null>(null);
  const onTextResponseRef = useRef<((text: string) => void) | null>(null);
  const onCutOffRef = useRef<((reason: string) => void) | null>(null);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(async () => {
    // MOCK MODE: Simulate connection without backend
    if (MOCK_MODE) {
      console.log('🧪 MOCK MODE: Simulating WebSocket connection...');
      setState(CallState.CONNECTING);
      setError(null);

      setTimeout(() => {
        console.log('✅ MOCK: Authentication successful');
        setState(CallState.AUTHENTICATING);

        setTimeout(() => {
          console.log('✅ MOCK: Ready to call');
          setState(CallState.READY);
          setBalance(60); // 60 seconds for testing
        }, 500);
      }, 1000);

      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    try {
      setState(CallState.CONNECTING);
      setError(null);

      console.log('🔌 Connecting to WebSocket server...');

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('✅ WebSocket connected');
        setState(CallState.AUTHENTICATING);

        // Authenticate with Firebase ID token
        const token = await getIdToken();
        if (!token) {
          throw new Error('Failed to get authentication token');
        }

        ws.send(JSON.stringify({
          type: 'auth',
          data: { token },
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setState(CallState.ERROR);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('📡 WebSocket disconnected');
        setState(CallState.DISCONNECTED);
        wsRef.current = null;

        // Auto-reconnect after 3 seconds (optional)
        // reconnectTimeoutRef.current = setTimeout(() => {
        //   if (state !== CallState.DISCONNECTED) {
        //     connect();
        //   }
        // }, 3000);
      };
    } catch (error: any) {
      console.error('❌ Failed to connect:', error);
      setState(CallState.ERROR);
      setError(error.message);
    }
  }, []);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearInterval(reconnectTimeoutRef.current);
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(CallState.DISCONNECTED);
    setBalance(null);
    setError(null);
  }, []);

  /**
   * Start voice call
   */
  const startCall = useCallback(async (
    characterId: string,
    characterName: string,
    characterProfile: any
  ) => {
    // MOCK MODE: Simulate call start
    if (MOCK_MODE) {
      console.log(`📞 MOCK: Starting call with ${characterName}...`);
      setState(CallState.CALLING);
      setBalance(60); // Start with 60 seconds

      // Countdown timer for testing 60-second cutoff
      const countdownInterval = setInterval(() => {
        setBalance((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            console.log('⏱️ MOCK: Time is up! Triggering cutoff...');

            // Trigger cutoff callback
            if (onCutOffRef.current) {
              onCutOffRef.current('Your 60 seconds are up!');
            }

            setState(CallState.READY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Decrease every second

      // Store interval reference for cleanup
      reconnectTimeoutRef.current = countdownInterval as any;
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    console.log(`📞 Starting call with ${characterName}...`);

    wsRef.current.send(JSON.stringify({
      type: 'start_call',
      data: {
        characterId,
        characterName,
        characterProfile,
      },
    }));
  }, []);

  /**
   * End voice call
   */
  const endCall = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    console.log('📴 Ending call...');

    wsRef.current.send(JSON.stringify({
      type: 'end_call',
      data: {},
    }));

    setState(CallState.READY);
  }, []);

  /**
   * Send audio data
   */
  const sendAudio = useCallback((audioBase64: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'audio',
      data: { audio: audioBase64 },
    }));
  }, []);

  /**
   * Send text message (for testing)
   */
  const sendText = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'text',
      data: { text },
    }));
  }, []);

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = (message: any) => {
    const { type, data } = message;

    console.log('📩 Received message:', type);

    switch (type) {
      case 'connected':
        console.log('✅ Server acknowledged connection');
        break;

      case 'auth_success':
        console.log('✅ Authentication successful');
        setState(CallState.READY);
        if (data && data.balance !== undefined) {
          setBalance(data.balance);
        }
        break;

      case 'call_started':
        console.log('✅ Call started');
        setState(CallState.CALLING);
        if (data && data.balance !== undefined) {
          setBalance(data.balance);
        }
        break;

      case 'call_rejected':
        console.warn('⚠️ Call rejected:', data?.reason || 'Unknown reason');
        setState(CallState.READY);
        setError(`Call rejected: ${data?.reason || 'Unknown reason'}`);
        if (data && data.balance !== undefined) {
          setBalance(data.balance);
        }
        break;

      case 'balance_update':
        // Real-time balance update during call
        if (data && data.balance !== undefined) {
          setBalance(data.balance);
        }
        break;

      case 'audio_response':
        // AI audio response
        if (onAudioResponseRef.current) {
          onAudioResponseRef.current(data.data);
        }
        break;

      case 'text_response':
        // AI text response
        if (onTextResponseRef.current) {
          onTextResponseRef.current(data.text);
        }
        break;

      case 'call_ended':
        const endReason = data?.reason || 'credits_depleted';
        const endMessage = data?.message || 'Your credits have ended';
        console.log('📴 Call ended - Reason:', endReason);
        console.log('📴 Call ended - Message:', endMessage);
        console.log('📴 Call ended - Full data:', JSON.stringify(data));
        console.log('📴 onCutOffRef.current exists:', !!onCutOffRef.current);

        setState(CallState.READY);

        // ALWAYS trigger cutoff callback when call ends - regardless of reason
        // This ensures the user sees the "Out of Credits" alert
        if (onCutOffRef.current) {
          console.log('🔔 Triggering cutoff callback with message:', endMessage);
          onCutOffRef.current(endMessage);
        } else {
          console.error('❌ CRITICAL: onCutOffRef.current is null - callback was not set!');
          console.error('❌ This means the user will NOT see the "Out of Credits" alert!');
        }
        break;

      case 'error':
        console.error('❌ Server error:', data.error);
        setError(data.error);
        break;

      case 'pong':
        // Heartbeat response
        break;

      default:
        console.warn('⚠️ Unknown message type:', type);
    }
  };

  /**
   * Set callback handlers
   */
  const setOnAudioResponse = useCallback((callback: (audioData: any) => void) => {
    onAudioResponseRef.current = callback;
  }, []);

  const setOnTextResponse = useCallback((callback: (text: string) => void) => {
    onTextResponseRef.current = callback;
  }, []);

  const setOnCutOff = useCallback((callback: (reason: string) => void) => {
    onCutOffRef.current = callback;
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    balance,
    error,
    connect,
    disconnect,
    startCall,
    endCall,
    sendAudio,
    sendText,
    onAudioResponse: onAudioResponseRef.current,
    onTextResponse: onTextResponseRef.current,
    onCutOff: onCutOffRef.current,
    setOnAudioResponse,
    setOnTextResponse,
    setOnCutOff,
  };
};
