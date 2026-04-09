const encoder = new TextEncoder();
const decoder = new TextDecoder();

const PBKDF2_SALT = 'blockchat-demo-salt';
const PBKDF2_ITERATIONS = 100000;
const SHARED_SECRET = 'blockchat-demo-shared-secret';

export function getRoomSecret(chatId, userId = 'guest') {
  // Semua peserta di room yang sama harus memakai secret yang sama agar saling bisa decrypt.
  return `${SHARED_SECRET}::room:${chatId}`;
}

function toBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(secret) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(PBKDF2_SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptMessage(plainText, secret = SHARED_SECRET) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secret);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(plainText),
  );

  return {
    iv: toBase64(iv),
    cipher: toBase64(new Uint8Array(encrypted)),
  };
}

export async function decryptMessage(payload, secret = SHARED_SECRET) {
  const key = await deriveKey(secret);
  const iv = fromBase64(payload.iv);
  const cipher = fromBase64(payload.cipher);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    cipher,
  );

  return decoder.decode(decrypted);
}
