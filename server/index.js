import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SocketClient } from '@cognigy/socket-client';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const PORT = process.env.PORT || 3000;
const COGNIGY_SOCKET_URL = process.env.COGNIGY_SOCKET_URL || 'https://endpoint-eu-dev-cai.cognigy.cloud/3e0aadbf61d13830f0831264e6adf289ae56068b957fff917759ec9af0e83522';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// SocketClient instance
let socket = null;
// Simple in-memory session state (single session for this tester app)
let sessionState = {
  userId: null,
  sessionId: null,
  iframeUrl: null,
  connected: false,
  lastError: null,
};

function isIframeUrl(text) {
  if (!text || typeof text !== 'string') return false;
  return /ai-copilot-.*cognigy\.cloud\/\?userId=.+&sessionId=.+&URLToken=.+/i.test(text);
}

function extractIframeUrlFromPayload(payload) {
  try {
    if (!payload) return null;
    if (typeof payload === 'string' && isIframeUrl(payload)) return payload;
    if (typeof payload === 'object') {
      // Search common fields
      const candidates = [payload.iframeUrl, payload.url, payload.link, payload.content];
      for (const c of candidates) {
        if (typeof c === 'string' && isIframeUrl(c)) return c;
      }
      // Deep search
      const asString = JSON.stringify(payload);
      const match = asString.match(/https:\/\/ai-copilot-[^\"\s]+/i);
      if (match && isIframeUrl(match[0])) return match[0];
    }
  } catch (_) {
    // ignore
  }
  return null;
}

app.post('/api/session/start', async (req, res) => {
  try {
    // Reset and create new session identifiers
    // A a unique user id could be generated for each transcript, but it is more useful a default user id for debugging in Cognigy
    // sessionState.userId = uuidv4();
    sessionState.userId = "tester-tool"
    sessionState.sessionId = uuidv4();
    sessionState.iframeUrl = null;
    sessionState.lastError = null;

    // Close previous socket if any
    if (socket) {
      try { socket.disconnect(); } catch (_) { }
      socket = null;
    }

    // Parse Cognigy Endpoint URL into server + token, per docs
    const fullUrl = new URL(COGNIGY_SOCKET_URL);
    const serverAddress = `${fullUrl.protocol}//${fullUrl.host}`;
    // pathname looks like '/<token>'
    const urlToken = fullUrl.pathname.replace(/^\//, '');
    console.log('[start] Connecting via @cognigy/socket-client:', { serverAddress, urlToken, userId: sessionState.userId, sessionId: sessionState.sessionId });

    // Close previous client if any
    if (socket && typeof socket.disconnect === 'function') {
      try {
        await socket.disconnect();
      } catch (error) {
        console.error('[cognigy] disconnect failed:', error?.message || error);
      }
    }

    // Create Cognigy SocketClient
    socket = new SocketClient(serverAddress, urlToken, {
      userId: sessionState.userId,
      sessionId: sessionState.sessionId,
      forceWebsockets: true,
    });

    let responded = false;
    const respondOnce = () => {
      if (responded) return;
      responded = true;
      res.json({
        ok: true,
        userId: sessionState.userId,
        sessionId: sessionState.sessionId,
        iframeUrl: sessionState.iframeUrl || null,
        notice: sessionState.iframeUrl ? undefined : 'Waiting for iframe URL from bot... poll /api/session/state',
      });
    };

    // Listen for output messages from AI Agent
    socket.on('output', (output) => {
      try {
        console.log('[cognigy] output:', output?.text || output?.data || output);
      } catch (_) { }
      const maybeUrl = extractIframeUrlFromPayload(output) || extractIframeUrlFromPayload(output?.text) || extractIframeUrlFromPayload(output?.data);
      if (maybeUrl) {
        sessionState.iframeUrl = maybeUrl;
        console.log('[cognigy] extracted iframeUrl:', maybeUrl);
      }
    });

    socket.on('error', (err) => {
      console.error('[cognigy] error:', err?.message || err, err);
      sessionState.lastError = { type: 'error', message: err?.message || String(err) };
    });

    // Connect
    try {
      await socket.connect();
      sessionState.connected = true;
      console.log('[cognigy] connected');
      respondOnce();
    } catch (err) {
      console.error('[cognigy] connect failed:', err?.message || err);
      sessionState.lastError = { type: 'connect_error', message: err?.message || String(err) };
      return res.status(500).json({ ok: false, error: 'connect_error', message: err?.message || String(err) });
    }

  } catch (error) {
    return res.status(500).json({ ok: false, error: 'unexpected', message: error?.message || String(error) });
  }
});

app.get('/api/session/state', (req, res) => {
  res.json({
    ok: true,
    connected: sessionState.connected,
    userId: sessionState.userId,
    sessionId: sessionState.sessionId,
    iframeUrl: sessionState.iframeUrl || null,
    lastError: sessionState.lastError || null,
  });
});

app.post('/api/session/send', (req, res) => {
  const { text, role } = req.body || {};
  if (!text || !socket || !sessionState.connected) {
    return res.status(400).json({ ok: false, error: 'not_ready_or_empty_text' });
  }
  try {
    if (!socket || !sessionState.connected) throw new Error('not connected');
    const extra = { role: role || 'unknown' };
    console.log('[cognigy] sendMessage:', { text, extra });
    socket.sendMessage(String(text), extra);
    return res.json({ ok: true });
  } catch (error) {
    console.error('[cognigy] send failed:', error?.message || error);
    return res.status(500).json({ ok: false, error: 'send_failed', message: err?.message || String(err) });
  }
});

app.post('/api/session/reset', (req, res) => {
  try {
    if (socket) {
      try {
        socket.disconnect();
      } catch (error) {
        console.error('[cognigy] disconnect failed:', error?.message || error);
      }
      socket = null;
    }
    sessionState = { userId: null, sessionId: null, iframeUrl: null, connected: false, lastError: null };
    res.json({ ok: true });
  } catch (error) {
    console.error('[cognigy] reset failed:', error?.message || error);
    res.status(500).json({ ok: false, error: 'reset_failed', message: err?.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
