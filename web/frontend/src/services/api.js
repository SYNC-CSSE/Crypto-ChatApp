import { STORAGE_KEYS } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function getAuthToken() {
  return localStorage.getItem(STORAGE_KEYS.authToken) || '';
}

async function parseResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.errors || payload?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (payload?.errors) {
    throw new Error(payload.errors);
  }

  return payload?.data;
}

async function request(path, { method = 'GET', body, requiresAuth = true } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
}

export function decodeJwtPayload(token) {
  if (!token || token.split('.').length < 2) return null;

  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const base64 = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    return JSON.parse(atob(base64));
  } catch (error) {
    return null;
  }
}

export async function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: payload,
    requiresAuth: false,
  });
}

export async function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: payload,
    requiresAuth: false,
  });
}

export async function requestResetPasswordCode(payload) {
  return request('/auth/reset-password/request', {
    method: 'POST',
    body: payload,
    requiresAuth: false,
  });
}

export async function verifyResetPasswordCode(payload) {
  return request('/auth/reset-password/verify', {
    method: 'POST',
    body: payload,
    requiresAuth: false,
  });
}

export async function confirmResetPassword(payload) {
  return request('/auth/reset-password/confirm', {
    method: 'POST',
    body: payload,
    requiresAuth: false,
  });
}

export async function updateCurrentUser(payload) {
  return request('/user/update', {
    method: 'PATCH',
    body: payload,
  });
}

export async function getMyChats(name) {
  const params = new URLSearchParams();
  if (name && name.trim()) {
    params.set('name', name.trim());
  }

  const query = params.toString();
  const url = query ? `/api/chats?${query}` : '/api/chats';
  return request(url);
}

export async function getChatDetail(chatId) {
  return request(`/api/chats/detail/${chatId}`);
}

export async function searchUsersByUsername(username) {
  const params = new URLSearchParams();
  if (username && username.trim()) {
    params.set('username', username.trim());
  }

  const query = params.toString();
  const url = query ? `/api/users/search?${query}` : '/api/users/search';
  return request(url);
}

export async function createGroupChat(payload) {
  return request('/api/chats/group', {
    method: 'POST',
    body: payload,
  });
}

export async function createPrivateChat(payload) {
  return request('/api/chats/private', {
    method: 'POST',
    body: payload,
  });
}

export async function updateGroup(chatId, payload) {
  return request(`/api/chats/group/edit/${chatId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function addGroupMembers(chatId, payload) {
  return request(`/api/chats/group/add/${chatId}`, {
    method: 'POST',
    body: payload,
  });
}

export async function removeGroupMembers(chatId, payload) {
  return request(`/api/chats/group/remove/${chatId}`, {
    method: 'DELETE',
    body: payload,
  });
}

export async function updateGroupMemberRoles(chatId, payload) {
  return request(`/api/chats/group/change-role/${chatId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function leaveGroup(chatId) {
  return request(`/api/chats/group/leave/${chatId}`, {
    method: 'DELETE',
  });
}

export async function getChatMessages(chatId) {
  return request(`/api/chats/messages/${chatId}`);
}

export async function sendChatMessage(chatId, payload) {
  return request(`/api/chats/messages/${chatId}`, {
    method: 'POST',
    body: payload,
  });
}

export function saveSession(token, currentUser) {
  localStorage.setItem(STORAGE_KEYS.authToken, token);
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.authToken);
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  localStorage.removeItem(STORAGE_KEYS.chatState);
  localStorage.removeItem(STORAGE_KEYS.users);
}
