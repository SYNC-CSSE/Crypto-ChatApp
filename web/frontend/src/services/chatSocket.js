import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { STORAGE_KEYS } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function buildSocketUrl() {
  return `${API_BASE_URL}/ws-chat`;
}

function getAuthHeader() {
  const token = localStorage.getItem(STORAGE_KEYS.authToken);
  return token ? `Bearer ${token}` : '';
}

export function createChatSocketClient({ onConnect, onDisconnect, onError } = {}) {
  const connectHeaders = {};
  const authHeader = getAuthHeader();

  if (authHeader) {
    connectHeaders.Authorization = authHeader;
  }

  const client = new Client({
    connectHeaders,
    webSocketFactory: () => new SockJS(buildSocketUrl()),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
    onConnect,
    onDisconnect,
    onStompError: (frame) => {
      if (onError) {
        onError(frame?.headers?.message || frame?.body || 'WebSocket STOMP error');
      }
    },
    onWebSocketError: (event) => {
      if (onError) {
        onError(event?.message || 'WebSocket connection error');
      }
    },
  });

  return client;
}

export function subscribeChatTopic(client, chatId, onMessage) {
  if (!client || !chatId || !onMessage) return null;

  return client.subscribe(`/topic/chat/${chatId}`, (frame) => {
    let payload = null;

    try {
      payload = JSON.parse(frame.body || '{}');
    } catch (error) {
      payload = null;
    }

    if (payload?.data) {
      onMessage(payload.data);
    }
  });
}

export function sendMessageViaSocket(client, chatId, messagePayload) {
  if (!client || !client.connected) {
    throw new Error('Socket belum terhubung.');
  }

  client.publish({
    destination: `/app/send-message/${chatId}`,
    body: JSON.stringify(messagePayload),
  });
}
