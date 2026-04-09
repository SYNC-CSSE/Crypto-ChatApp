export const STORAGE_KEYS = {
  users: 'blockchat_users',
  currentUser: 'blockchat_current_user',
  authToken: 'blockchat_auth_token',
  chatState: 'blockchat_chat_state',
};

export const DUMMY_USERS = [
  {
    id: 'u1',
    username: 'satoshi_nakamoto',
    email: 'satoshi@bitcoin.org',
    password: '12345678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SatoshiUser',
  },
  {
    id: 'u2',
    username: 'vitalik',
    email: 'vitalik@ethereum.org',
    password: '12345678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VitalikUser',
  },
  {
    id: 'u3',
    username: 'hal_finney',
    email: 'hal@bitcoin.org',
    password: '12345678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HalUser',
  },
  {
    id: 'u4',
    username: 'ada_lovelace',
    email: 'ada@analytical.engine',
    password: '12345678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdaUser',
  },
  {
    id: 'u5',
    username: 'grace_hopper',
    email: 'grace@cobol.dev',
    password: '12345678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GraceUser',
  },
];

export const DUMMY_CHAT_STATE = {
  chats: [
    {
      id: '34f6a819-4fdb-489d-bfc1-df9dc49935ad',
      type: 'PRIVATE',
      name: null,
      created_by: 'u1',
      created_at: '2026-03-20T10:00:00.000Z',
    },
    {
      id: '9a1916aa-7935-4ad1-9bc5-c85bfc56f9af',
      type: 'PRIVATE',
      name: null,
      created_by: 'u4',
      created_at: '2026-03-21T07:00:00.000Z',
    },
    {
      id: '0630d4ad-e82f-4e56-ae3d-caa71cd8cf37',
      type: 'GROUP',
      name: 'BlockChat Team',
      created_by: 'u1',
      created_at: '2026-03-18T12:00:00.000Z',
    },
  ],
  chatParticipants: [
    {
      id: '9076cc2e-3cc2-4425-8016-189844ac3ce8',
      chat_id: '34f6a819-4fdb-489d-bfc1-df9dc49935ad',
      user_id: 'u1',
      role: 'ADMIN',
      joined_at: '2026-03-20T10:00:00.000Z',
    },
    {
      id: '9f7fb299-f7ba-45d4-ad53-a8ff28267c5e',
      chat_id: '34f6a819-4fdb-489d-bfc1-df9dc49935ad',
      user_id: 'u2',
      role: 'MEMBER',
      joined_at: '2026-03-20T10:00:00.000Z',
    },
    {
      id: '3aeca07d-c0e8-48f8-a92e-ce60e69c16de',
      chat_id: '9a1916aa-7935-4ad1-9bc5-c85bfc56f9af',
      user_id: 'u1',
      role: 'MEMBER',
      joined_at: '2026-03-21T07:00:00.000Z',
    },
    {
      id: 'a6f96661-7a56-428f-88a8-b3e6e61323be',
      chat_id: '9a1916aa-7935-4ad1-9bc5-c85bfc56f9af',
      user_id: 'u4',
      role: 'ADMIN',
      joined_at: '2026-03-21T07:00:00.000Z',
    },
    {
      id: '9a3a68de-5fd8-4513-af4d-f0bdf1836e2d',
      chat_id: '0630d4ad-e82f-4e56-ae3d-caa71cd8cf37',
      user_id: 'u1',
      role: 'ADMIN',
      joined_at: '2026-03-18T12:00:00.000Z',
    },
    {
      id: '0955fdb3-a1c8-4e22-9644-6c4a3f93f76c',
      chat_id: '0630d4ad-e82f-4e56-ae3d-caa71cd8cf37',
      user_id: 'u2',
      role: 'MEMBER',
      joined_at: '2026-03-18T12:00:00.000Z',
    },
    {
      id: '43c2d181-0888-4e37-a70d-738d305f8e34',
      chat_id: '0630d4ad-e82f-4e56-ae3d-caa71cd8cf37',
      user_id: 'u3',
      role: 'MEMBER',
      joined_at: '2026-03-18T12:00:00.000Z',
    },
  ],
  messages: [
    {
      id: 'b3602ca6-f3a3-4f24-b476-ebfdd9ea3e57',
      chat_id: '34f6a819-4fdb-489d-bfc1-df9dc49935ad',
      sender_id: 'u2',
      content: 'Hey! Did you check the latest transaction?',
      iv: null,
      type: 'TEXT',
      created_at: '2026-03-27T10:30:00.000Z',
    },
    {
      id: '45f73656-4d1f-4f44-b616-fd92a26068d2',
      chat_id: '34f6a819-4fdb-489d-bfc1-df9dc49935ad',
      sender_id: 'u1',
      content: 'Yes, it went through perfectly. The encryption works like a charm.',
      iv: null,
      type: 'TEXT',
      created_at: '2026-03-27T10:32:00.000Z',
    },
    {
      id: '5295774d-5dc8-4c3a-bce7-f9284dcb2df7',
      chat_id: '9a1916aa-7935-4ad1-9bc5-c85bfc56f9af',
      sender_id: 'u4',
      content: 'I reviewed your algorithm.',
      iv: null,
      type: 'TEXT',
      created_at: '2026-03-26T13:14:00.000Z',
    },
    {
      id: '833ca40f-68c8-4c31-a7bf-e6e7f881f0be',
      chat_id: '0630d4ad-e82f-4e56-ae3d-caa71cd8cf37',
      sender_id: 'u3',
      content: 'Welcome to BlockChat. This group is ready.',
      iv: null,
      type: 'TEXT',
      created_at: '2026-03-25T09:00:00.000Z',
    },
    {
      id: '9c89d0c4-f72c-4efa-b58a-89f5574f40e4',
      chat_id: '0630d4ad-e82f-4e56-ae3d-caa71cd8cf37',
      sender_id: 'u2',
      content: 'Siap, nanti kita bahas roadmap enkripsi.',
      iv: null,
      type: 'TEXT',
      created_at: '2026-03-25T09:05:00.000Z',
    },
  ],
  readReceipts: [
    {
      id: '05125518-50e8-4928-9c5f-8de930f15291',
      message_id: 'b3602ca6-f3a3-4f24-b476-ebfdd9ea3e57',
      user_id: 'u1',
      read_at: '2026-03-27T10:31:00.000Z',
    },
    {
      id: 'af8ae817-95f5-4f0f-a8cc-8f893492264b',
      message_id: '45f73656-4d1f-4f44-b616-fd92a26068d2',
      user_id: 'u2',
      read_at: '2026-03-27T10:34:00.000Z',
    },
    {
      id: '44af7946-c17b-4d8d-b4b7-ec6d9ba6ec8e',
      message_id: '5295774d-5dc8-4c3a-bce7-f9284dcb2df7',
      user_id: 'u1',
      read_at: '2026-03-26T13:20:00.000Z',
    },
    {
      id: '71458e88-c1a7-4e66-b695-bf6e9f641788',
      message_id: '833ca40f-68c8-4c31-a7bf-e6e7f881f0be',
      user_id: 'u1',
      read_at: '2026-03-25T09:10:00.000Z',
    },
  ],
};

export const DUMMY_CHATS = [
  {
    id: 1,
    name: 'Satoshi Nakamoto',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Satoshi',
    lastMessage: 'The block is mined successfully.',
    time: '10:42 AM',
    unread: 2,
    isOnline: true,
  },
  {
    id: 2,
    name: 'Vitalik Buterin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vitalik',
    lastMessage: "Let's talk about the new smart contract.",
    time: 'Yesterday',
    unread: 0,
    isOnline: false,
  },
  {
    id: 3,
    name: 'Hal Finney',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hal',
    lastMessage: 'Running bitcoin',
    time: 'Yesterday',
    unread: 0,
    isOnline: false,
  },
  {
    id: 4,
    name: 'Ada Lovelace',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ada',
    lastMessage: 'I reviewed your algorithm.',
    time: 'Tuesday',
    unread: 5,
    isOnline: true,
  },
  {
    id: 5,
    name: 'BlockChat Team',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=BlockChat',
    lastMessage: 'Welcome to the decentralized chat network!',
    time: 'Monday',
    unread: 0,
    isOnline: true,
  },
];

export const DUMMY_MESSAGES_BY_CHAT = {
  1: [
    { id: 1, senderId: 1, text: 'Hey! Did you check the latest transaction?', time: '10:30 AM', isMe: false, status: 'read' },
    { id: 2, senderId: 'me', text: 'Yes, it went through perfectly. The encryption works like a charm.', time: '10:32 AM', isMe: true, status: 'read' },
    { id: 3, senderId: 1, text: 'Awesome! Web3 messaging is definitely the future.', time: '10:33 AM', isMe: false, status: 'read' },
    { id: 4, senderId: 'me', text: 'Agreed. Next step is to implement the IPFS sync.', time: '10:40 AM', isMe: true, status: 'sent' },
  ],
  2: [
    { id: 5, senderId: 2, text: 'Gas fee is a bit high right now.', time: '09:12 AM', isMe: false, status: 'read' },
    { id: 6, senderId: 'me', text: 'Yes, maybe wait for less network congestion.', time: '09:15 AM', isMe: true, status: 'read' },
  ],
  3: [
    { id: 7, senderId: 3, text: 'Running bitcoin.', time: 'Yesterday', isMe: false, status: 'read' },
  ],
  4: [
    { id: 8, senderId: 4, text: 'I reviewed your algorithm.', time: 'Tuesday', isMe: false, status: 'read' },
  ],
  5: [
    { id: 9, senderId: 5, text: 'Welcome to BlockChat. This is dummy data for testing.', time: 'Monday', isMe: false, status: 'read' },
  ],
};

export function initializeDummyUsers() {
  if (typeof window === 'undefined') return;
  const users = localStorage.getItem(STORAGE_KEYS.users);
  if (!users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(DUMMY_USERS));
  }
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function createEmptyChatState() {
  return {
    chats: [],
    chatParticipants: [],
    messages: [],
    readReceipts: [],
  };
}

export function initializeDummyChatState() {
  if (typeof window === 'undefined') return;
  const chatState = localStorage.getItem(STORAGE_KEYS.chatState);
  if (!chatState) {
    localStorage.setItem(STORAGE_KEYS.chatState, JSON.stringify(DUMMY_CHAT_STATE));
  }
}

export function getStoredChatState() {
  const stored = localStorage.getItem(STORAGE_KEYS.chatState);
  if (!stored) return createEmptyChatState();

  try {
    const parsed = JSON.parse(stored);
    if (
      !parsed
      || !Array.isArray(parsed.chats)
      || !Array.isArray(parsed.chatParticipants)
      || !Array.isArray(parsed.messages)
      || !Array.isArray(parsed.readReceipts)
    ) {
      return createEmptyChatState();
    }

    return parsed;
  } catch (error) {
    return createEmptyChatState();
  }
}

export function saveStoredChatState(chatState) {
  localStorage.setItem(STORAGE_KEYS.chatState, JSON.stringify(chatState));
}

export function getStoredUsers() {
  const users = localStorage.getItem(STORAGE_KEYS.users);
  return users ? JSON.parse(users) : [];
}

export function saveStoredUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}
