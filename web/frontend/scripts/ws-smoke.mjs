import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const USERNAME = process.env.WS_USERNAME || 'beta';
const PASSWORD = process.env.WS_PASSWORD || 'Password123';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const json = await response.json();
  if (!response.ok || json?.errors) {
    throw new Error(json?.errors || `HTTP ${response.status}`);
  }
  return json?.data;
}

async function login() {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
}

async function getChats(token) {
  return request('/api/chats', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

function connectStomp(token) {
  return new Promise((resolve, reject) => {
    const client = new Client({
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws-chat`),
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => resolve(client),
      onStompError: (frame) => reject(new Error(frame?.headers?.message || frame?.body || 'STOMP error')),
      onWebSocketError: (event) => reject(new Error(event?.message || 'WebSocket error')),
    });

    client.activate();
  });
}

async function main() {
  const token = await login();
  const chats = await getChats(token);

  if (!Array.isArray(chats) || chats.length === 0) {
    throw new Error('Tidak ada chat untuk diuji websocket.');
  }

  const targetChat = chats[0];
  const chatId = targetChat.id;

  const client = await connectStomp(token);

  const received = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: tidak menerima broadcast websocket.'));
    }, 10000);

    client.subscribe(`/topic/chat/${chatId}`, (frame) => {
      try {
        const payload = JSON.parse(frame.body || '{}');
        clearTimeout(timeout);
        resolve(payload?.data || payload);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  });

  client.publish({
    destination: `/app/send-message/${chatId}`,
    body: JSON.stringify({
      content: `WS smoke test ${new Date().toISOString()}`,
      iv: null,
      type: 'TEXT',
    }),
  });

  const result = await received;
  console.log('WS_OK', JSON.stringify({ chatId, result }, null, 2));

  await client.deactivate();
}

main().catch((error) => {
  console.error('WS_FAIL', error.message);
  process.exit(1);
});
