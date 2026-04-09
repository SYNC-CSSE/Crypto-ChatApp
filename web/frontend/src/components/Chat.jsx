import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MoreVertical, 
  MessageSquarePlus, 
  Users,
  UserPlus,
  Send,
  Check,
  CheckCheck,
  Lock,
  ArrowLeft,
  Settings,
  X
} from 'lucide-react';
import { STORAGE_KEYS, getStoredChatState, getStoredUsers, saveStoredChatState, saveStoredUsers } from '../data/mockData';
import { decryptMessage, encryptMessage, getRoomSecret } from '../utils/cryptoChat';
import {
  addGroupMembers,
  clearSession,
  createPrivateChat,
  createGroupChat,
  getChatMessages,
  getChatDetail,
  getMyChats,
  leaveGroup,
  removeGroupMembers,
  searchUsersByUsername,
  sendChatMessage,
  updateGroup,
  updateGroupMemberRoles,
} from '../services/api';
import { createChatSocketClient, sendMessageViaSocket, subscribeChatTopic } from '../services/chatSocket';

const FAILED_DECRYPT_TEXT = '[Pesan terenkripsi gagal dibuka]';
const EMOJI_REGEX = /[\p{Extended_Pictographic}\uFE0F]/u;

function containsEmoji(text) {
  return EMOJI_REGEX.test(text);
}

function stripEmoji(text) {
  return text.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '');
}

function createUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseChatDate(value) {
  if (!value) return new Date();

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date() : value;
  }

  if (typeof value === 'number') {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? new Date() : fromNumber;
  }

  const raw = String(value).trim();
  if (!raw) return new Date();

  const timeOnlyMatch = raw.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (timeOnlyMatch) {
    const now = new Date();
    const hour = Number(timeOnlyMatch[1]);
    const minute = Number(timeOnlyMatch[2]);
    const second = Number(timeOnlyMatch[3] || '0');

    if (hour <= 23 && minute <= 59 && second <= 59) {
      const withToday = new Date(now);
      withToday.setHours(hour, minute, second, 0);
      return withToday;
    }
  }

  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatClock(isoDate) {
  return parseChatDate(isoDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatListTime(isoDate) {
  const date = parseChatDate(isoDate);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate()
    && date.getMonth() === now.getMonth()
    && date.getFullYear() === now.getFullYear();

  if (isToday) return formatClock(isoDate);

  return date.toLocaleDateString([], { weekday: 'short' });
}

function formatDateTime(isoDate) {
  return parseChatDate(isoDate).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function normalizeApiMessage(messageResponse, { chatId, currentUserId, currentUsername, usersById, membersByUsername }) {
  const senderName = messageResponse?.sender || '';
  const senderIdByMember = membersByUsername[senderName];
  const senderIdByUser = Object.values(usersById).find((user) => user.username === senderName)?.id;

  const senderId = senderName === currentUsername
    ? currentUserId
    : (senderIdByMember || senderIdByUser || senderName || currentUserId);

  return {
    id: messageResponse?.id || createUuid(),
    chat_id: chatId,
    sender_id: senderId,
    content: messageResponse?.content || '',
    iv: messageResponse?.iv ?? null,
    type: messageResponse?.type || 'TEXT',
    created_at: messageResponse?.time || new Date().toISOString(),
  };
}

export default function Chat() {
  const [chatState, setChatState] = useState(getStoredChatState);
  const [allUsers, setAllUsers] = useState(getStoredUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isCreatePrivateModalOpen, setIsCreatePrivateModalOpen] = useState(false);
  const [selectedPrivateUserId, setSelectedPrivateUserId] = useState('');
  const [privateSearchQuery, setPrivateSearchQuery] = useState('');
  const [privateSearchResults, setPrivateSearchResults] = useState([]);
  const [isSearchingPrivateUsers, setIsSearchingPrivateUsers] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [membersToAdd, setMembersToAdd] = useState([]);
  const [isGroupDetailModalOpen, setIsGroupDetailModalOpen] = useState(false);
  const [groupDetailChatId, setGroupDetailChatId] = useState('');
  const [editedGroupName, setEditedGroupName] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const socketClientRef = useRef(null);
  const socketSubscriptionsRef = useRef({});
  const allUsersRef = useRef([]);

  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || 'null');
  const currentUserId = currentUser?.id || '';
  const currentUsername = currentUser?.username || '';
  const navigate = useNavigate();

  const upsertIncomingMessage = (chatId, messageResponse) => {
    setChatState((prev) => {
      const participants = prev.chatParticipants.filter((participant) => participant.chat_id === chatId);
      const membersByUsername = {};

      for (const participant of participants) {
        const user = allUsersRef.current.find((row) => row.id === participant.user_id);
        if (user?.username) {
          membersByUsername[user.username] = participant.user_id;
        }
      }

      const usersById = {};
      for (const user of allUsersRef.current) {
        usersById[user.id] = user;
      }

      const incomingMessage = normalizeApiMessage(messageResponse, {
        chatId,
        currentUserId,
        currentUsername,
        usersById,
        membersByUsername,
      });

      if (prev.messages.some((message) => message.id === incomingMessage.id)) {
        return prev;
      }

      return {
        ...prev,
        messages: [...prev.messages, incomingMessage],
      };
    });
  };

  const loadChatsFromApi = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.authToken);
    if (!token || !currentUserId) {
      setApiError('Sesi login tidak ditemukan. Silakan login lagi.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const chats = await getMyChats();

      const usersById = {};
      if (currentUserId) {
        usersById[currentUserId] = {
          id: currentUserId,
          username: currentUser?.username || 'Me',
          email: currentUser?.email || '',
          avatar: currentUser?.avatar
            || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser?.username || currentUserId)}`,
        };
      }

      const chatParticipants = [];
      const normalizedChats = [];
      const normalizedMessages = [];

      const chatBundles = await Promise.all((chats || []).map(async (chat) => {
        const [detail, messages] = await Promise.all([
          getChatDetail(chat.id),
          getChatMessages(chat.id),
        ]);

        return {
          chat,
          detail,
          messages,
        };
      }));

      for (const bundle of chatBundles) {
        const { chat, detail, messages } = bundle;

        normalizedChats.push({
          id: chat.id,
          type: chat.type,
          name: chat.name,
          created_by: detail?.createdBy || currentUser?.username || 'System',
          created_at: chat.createdAt || detail?.createdAt || new Date().toISOString(),
        });

        const membersByUsername = {};

        for (const member of detail?.members || []) {
          chatParticipants.push({
            id: `${chat.id}-${member.id}`,
            chat_id: chat.id,
            user_id: member.id,
            role: member.role,
            joined_at: member.joinedAt || new Date().toISOString(),
          });

          membersByUsername[member.username] = member.id;

          usersById[member.id] = {
            id: member.id,
            username: member.username,
            email: member.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.username || member.id)}`,
          };
        }

        for (const messageRow of messages || []) {
          normalizedMessages.push(normalizeApiMessage(messageRow, {
            chatId: chat.id,
            currentUserId,
            currentUsername,
            usersById,
            membersByUsername,
          }));
        }
      }

      const users = Object.values(usersById);
      setAllUsers(users);
      saveStoredUsers(users);

      setChatState((prev) => ({
        chats: normalizedChats,
        chatParticipants,
        messages: normalizedMessages,
        readReceipts: prev.readReceipts || [],
      }));
    } catch (error) {
      const errorMessage = error.message || 'Gagal memuat data chat dari server.';
      setApiError(errorMessage);

      if (/401|403|unauthorized|forbidden/i.test(errorMessage)) {
        clearSession();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChatsFromApi();
  }, []);

  useEffect(() => {
    allUsersRef.current = allUsers;
  }, [allUsers]);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.authToken);
    if (!token || !currentUserId) return undefined;

    const client = createChatSocketClient({
      onConnect: () => {
        setIsSocketConnected(true);
        setApiError('');
      },
      onDisconnect: () => {
        setIsSocketConnected(false);
      },
      onError: (socketError) => {
        setIsSocketConnected(false);
        setApiError(socketError || 'Koneksi realtime terputus. Fallback ke REST tetap aktif.');
      },
    });

    socketClientRef.current = client;
    client.activate();

    return () => {
      const subscriptions = socketSubscriptionsRef.current;
      Object.values(subscriptions).forEach((subscription) => {
        subscription?.unsubscribe?.();
      });
      socketSubscriptionsRef.current = {};

      if (client.active) {
        client.deactivate();
      }

      socketClientRef.current = null;
      setIsSocketConnected(false);
    };
  }, [currentUserId]);

  const participantsByChat = useMemo(() => {
    const map = {};

    for (const participant of chatState.chatParticipants) {
      if (!map[participant.chat_id]) {
        map[participant.chat_id] = [];
      }
      map[participant.chat_id].push(participant);
    }

    return map;
  }, [chatState.chatParticipants]);

  const messagesByChat = useMemo(() => {
    const map = {};

    for (const message of chatState.messages) {
      if (!map[message.chat_id]) {
        map[message.chat_id] = [];
      }
      map[message.chat_id].push(message);
    }

    Object.keys(map).forEach((chatId) => {
      map[chatId].sort((a, b) => parseChatDate(a.created_at) - parseChatDate(b.created_at));
    });

    return map;
  }, [chatState.messages]);

  const receiptsByMessage = useMemo(() => {
    const map = {};

    for (const receipt of chatState.readReceipts) {
      if (!map[receipt.message_id]) {
        map[receipt.message_id] = [];
      }
      map[receipt.message_id].push(receipt);
    }

    return map;
  }, [chatState.readReceipts]);

  const userMap = useMemo(() => {
    const map = {};
    for (const user of allUsers) {
      map[user.id] = user;
    }
    return map;
  }, [allUsers]);

  const currentUserChatIds = useMemo(() => {
    return new Set(chatState.chats.map((chat) => chat.id));
  }, [chatState.chats]);

  const chatList = useMemo(() => {
    const rows = [];

    for (const chat of chatState.chats) {
      if (!currentUserChatIds.has(chat.id)) continue;

      const participants = participantsByChat[chat.id] || [];
      const latestMessage = (messagesByChat[chat.id] || []).slice(-1)[0] || null;
      const unread = (messagesByChat[chat.id] || []).filter((message) => {
        if (message.sender_id === currentUserId) return false;
        const receipts = receiptsByMessage[message.id] || [];
        return !receipts.some((receipt) => receipt.user_id === currentUserId);
      }).length;

      let title = 'Unknown Chat';
      let avatar = 'https://api.dicebear.com/7.x/shapes/svg?seed=UnknownChat';
      let isOnline = false;

      if (chat.type === 'GROUP') {
        title = chat.name || 'Untitled Group';
        avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(chat.id)}`;
      } else {
        const otherUser = participants
          .map((participant) => userMap[participant.user_id])
          .find((user) => user && user.id !== currentUserId);
        if (otherUser) {
          title = otherUser.username;
          avatar = otherUser.avatar;
          isOnline = ['u2', 'u4'].includes(otherUser.id);
        } else if (chat.name) {
          title = chat.name;
          avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(chat.name)}`;
        }
      }

      let lastMessageText = 'Belum ada pesan';
      if (latestMessage) {
        if (latestMessage.iv) {
          lastMessageText = latestMessage.sender_id === currentUserId
            ? 'Kamu: Pesan terenkripsi'
            : 'Pesan terenkripsi';
        } else if (latestMessage.type === 'TEXT') {
          const prefix = latestMessage.sender_id === currentUserId
            ? 'Kamu: '
            : '';
          lastMessageText = `${prefix}${latestMessage.content}`;
        } else {
          lastMessageText = `${latestMessage.type} message`;
        }
      }

      rows.push({
        ...chat,
        title,
        avatar,
        isOnline,
        unread,
        lastMessageText,
        listTime: latestMessage ? formatListTime(latestMessage.created_at) : formatListTime(chat.created_at),
        latestMessageCreatedAt: latestMessage?.created_at || chat.created_at,
        participants,
      });
    }

    rows.sort((a, b) => parseChatDate(b.latestMessageCreatedAt) - parseChatDate(a.latestMessageCreatedAt));

    return rows;
  }, [
    chatState.chats,
    currentUserChatIds,
    participantsByChat,
    messagesByChat,
    receiptsByMessage,
    userMap,
    currentUserId,
  ]);

  const [activeChatId, setActiveChatId] = useState('');

  useEffect(() => {
    if (!isSocketConnected || !socketClientRef.current) return;

    const activeChatIds = new Set(chatState.chats.map((chat) => chat.id));
    const subscriptions = socketSubscriptionsRef.current;

    Object.keys(subscriptions).forEach((chatId) => {
      if (!activeChatIds.has(chatId)) {
        subscriptions[chatId]?.unsubscribe?.();
        delete subscriptions[chatId];
      }
    });

    for (const chat of chatState.chats) {
      if (subscriptions[chat.id]) continue;

      subscriptions[chat.id] = subscribeChatTopic(socketClientRef.current, chat.id, (incoming) => {
        upsertIncomingMessage(chat.id, incoming);
      });
    }
  }, [chatState.chats, isSocketConnected]);

  useEffect(() => {
    if (activeChatId) {
      const stillExists = chatList.some((chat) => chat.id === activeChatId);
      if (stillExists) return;
    }

    setActiveChatId(chatList[0]?.id || '');
  }, [chatList, activeChatId]);

  const activeChat = chatList.find((chat) => chat.id === activeChatId) || null;
  const messages = activeChat ? messagesByChat[activeChat.id] || [] : [];

  const roomSecret = activeChat
    ? getRoomSecret(activeChat.id)
    : getRoomSecret('default');
  const filteredChats = chatList.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  const activeParticipants = activeChat ? participantsByChat[activeChat.id] || [] : [];
  const currentUserRole = activeParticipants.find((p) => p.user_id === currentUserId)?.role;

  const groupDetailChat = chatList.find((chat) => chat.id === groupDetailChatId && chat.type === 'GROUP') || null;
  const groupDetailParticipants = groupDetailChat ? (participantsByChat[groupDetailChat.id] || []) : [];
  const groupDetailCurrentUserRole = groupDetailParticipants.find((participant) => participant.user_id === currentUserId)?.role;
  const groupCreator = groupDetailChat ? userMap[groupDetailChat.created_by] : null;

  const contactsToCreateGroup = allUsers.filter((user) => user.id !== currentUserId);
  const hasPrivateChatWithUser = (userId) => chatState.chats.some((chat) => {
    if (chat.type !== 'PRIVATE') return false;
    const members = participantsByChat[chat.id] || [];
    return members.some((member) => member.user_id === userId) && members.some((member) => member.user_id === currentUserId);
  });

  const contactsForPrivateChat = allUsers.filter((user) => {
    if (user.id === currentUserId) return false;

    return !hasPrivateChatWithUser(user.id);
  });

  const privateChatCandidates = (privateSearchQuery.trim().length >= 2
    ? privateSearchResults
    : contactsForPrivateChat)
    .filter((user) => user.id !== currentUserId && !hasPrivateChatWithUser(user.id));

  const addableUsers = activeChat
    ? allUsers.filter((user) => user.id !== currentUserId && !activeParticipants.some((p) => p.user_id === user.id))
    : [];

  useEffect(() => {
    saveStoredChatState(chatState);
  }, [chatState]);

  useEffect(() => {
    if (!isCreatePrivateModalOpen) return undefined;

    const keyword = privateSearchQuery.trim();
    if (keyword.length < 2) {
      setPrivateSearchResults([]);
      setIsSearchingPrivateUsers(false);
      return undefined;
    }

    let isCancelled = false;

    const timeoutId = setTimeout(async () => {
      setIsSearchingPrivateUsers(true);

      try {
        const users = await searchUsersByUsername(keyword);
        if (isCancelled) return;

        const normalized = (users || []).map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username || user.id)}`,
        }));

        setPrivateSearchResults(normalized);

        setAllUsers((prev) => {
          const map = {};
          for (const row of [...prev, ...normalized]) {
            map[row.id] = row;
          }
          const merged = Object.values(map);
          saveStoredUsers(merged);
          return merged;
        });
      } catch (error) {
        if (!isCancelled) {
          setApiError(error.message || 'Gagal mencari user.');
        }
      } finally {
        if (!isCancelled) {
          setIsSearchingPrivateUsers(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isCreatePrivateModalOpen, privateSearchQuery]);

  const markChatAsRead = (chatId) => {
    const unreadIncoming = (messagesByChat[chatId] || []).filter((message) => {
      if (message.sender_id === currentUserId) return false;
      const receipts = receiptsByMessage[message.id] || [];
      return !receipts.some((receipt) => receipt.user_id === currentUserId);
    });

    if (unreadIncoming.length === 0) return;

    setChatState((prev) => ({
      ...prev,
      readReceipts: [
        ...prev.readReceipts,
        ...unreadIncoming.map((message) => ({
          id: createUuid(),
          message_id: message.id,
          user_id: currentUserId,
          read_at: new Date().toISOString(),
        })),
      ],
    }));
  };

  useEffect(() => {
    if (!activeChatId || !currentUserId) return;
    markChatAsRead(activeChatId);
  }, [activeChatId, currentUserId]);

  useEffect(() => {
    let isCancelled = false;

    const decryptUnreadMessages = async () => {
      const updates = {};

      for (const msg of messages) {
        const hasEncryptedPayload = Boolean(msg.iv && msg.content);
        const canDecrypt = hasEncryptedPayload && !decryptedMessages[msg.id];
        if (!canDecrypt) continue;

        try {
          updates[msg.id] = await decryptMessage({ iv: msg.iv, cipher: msg.content }, roomSecret);
        } catch (error) {
          updates[msg.id] = FAILED_DECRYPT_TEXT;
        }
      }

      if (!isCancelled && Object.keys(updates).length > 0) {
        setDecryptedMessages((prev) => ({ ...prev, ...updates }));
      }
    };

    decryptUnreadMessages();

    return () => {
      isCancelled = true;
    };
  }, [messages, decryptedMessages, roomSecret]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUserId) return;

    if (containsEmoji(newMessage)) {
      setMessageError('Chat hanya mendukung teks tanpa emoji.');
      return;
    }

    const nowIso = new Date().toISOString();
    const trimmedMessage = newMessage.trim();
    const messageId = createUuid();

    let outgoingMessage;

    try {
      const encryptedPayload = await encryptMessage(trimmedMessage, roomSecret);
      outgoingMessage = {
        id: messageId,
        chat_id: activeChat.id,
        sender_id: currentUserId,
        content: encryptedPayload.cipher,
        iv: encryptedPayload.iv,
        type: 'TEXT',
        created_at: nowIso,
      };
      setDecryptedMessages((prev) => ({ ...prev, [messageId]: trimmedMessage }));
    } catch (error) {
      outgoingMessage = {
        id: messageId,
        chat_id: activeChat.id,
        sender_id: currentUserId,
        content: trimmedMessage,
        iv: null,
        type: 'TEXT',
        created_at: nowIso,
      };
    }

    try {
      if (isSocketConnected && socketClientRef.current?.connected) {
        sendMessageViaSocket(socketClientRef.current, activeChat.id, {
          content: outgoingMessage.content,
          iv: outgoingMessage.iv,
          type: outgoingMessage.type,
        });
      } else {
        const response = await sendChatMessage(activeChat.id, {
          content: outgoingMessage.content,
          iv: outgoingMessage.iv,
          type: outgoingMessage.type,
        });

        const senderId = response?.sender === currentUser?.username
          ? currentUserId
          : (allUsers.find((u) => u.username === response?.sender)?.id || response?.sender || currentUserId);

        const persistedMessage = {
          id: response?.id || messageId,
          chat_id: activeChat.id,
          sender_id: senderId,
          content: response?.content || outgoingMessage.content,
          iv: response?.iv ?? outgoingMessage.iv,
          type: response?.type || 'TEXT',
          created_at: response?.time || nowIso,
        };

        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, persistedMessage],
        }));
      }
    } catch (error) {
      setMessageError(error.message || 'Gagal mengirim pesan ke server.');
      return;
    }

    setNewMessage('');
    setMessageError('');
  };

  const selectChat = (chat) => {
    setActiveChatId(chat.id);
    setIsMobileListVisible(false);
    markChatAsRead(chat.id);
    setMessageError('');
  };

  const openGroupDetail = (chatId) => {
    setGroupDetailChatId(chatId);
    const targetGroup = chatList.find((chat) => chat.id === chatId && chat.type === 'GROUP');
    setEditedGroupName(targetGroup?.name || '');
    setIsGroupDetailModalOpen(true);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || newGroupMembers.length === 0 || !currentUserId) return;

    try {
      const response = await createGroupChat({
        name: newGroupName.trim(),
        memberIds: newGroupMembers,
      });

      await loadChatsFromApi();

      setNewGroupName('');
      setNewGroupMembers([]);
      setIsCreateGroupModalOpen(false);
      setActiveChatId(response?.id || '');
      setIsMobileListVisible(false);
      setApiError('');
    } catch (error) {
      setApiError(error.message || 'Gagal membuat group.');
    }
  };

  const handleCreatePrivateChat = async (e) => {
    e.preventDefault();

    if (!selectedPrivateUserId) return;

    try {
      const response = await createPrivateChat({ targetUserId: selectedPrivateUserId });

      await loadChatsFromApi();

      setSelectedPrivateUserId('');
      setPrivateSearchQuery('');
      setPrivateSearchResults([]);
      setIsCreatePrivateModalOpen(false);
      setActiveChatId(response?.id || '');
      setIsMobileListVisible(false);
      setApiError('');
    } catch (error) {
      setApiError(error.message || 'Gagal membuat private chat.');
    }
  };

  const handleAddMembersToGroup = async (e) => {
    e.preventDefault();
    if (!activeChat || activeChat.type !== 'GROUP' || membersToAdd.length === 0) return;

    try {
      await addGroupMembers(activeChat.id, { userIds: membersToAdd });
      await loadChatsFromApi();
      setMembersToAdd([]);
      setIsAddMemberModalOpen(false);
      setApiError('');
    } catch (error) {
      setApiError(error.message || 'Gagal menambah anggota group.');
    }
  };

  const handleRenameGroup = async () => {
    if (!groupDetailChat || !editedGroupName.trim()) return;

    try {
      await updateGroup(groupDetailChat.id, { name: editedGroupName.trim() });
      await loadChatsFromApi();
      setApiError('');
    } catch (error) {
      setApiError(error.message || 'Gagal mengganti nama group.');
    }
  };

  const handleChangeMemberRole = async (userId, role) => {
    if (!groupDetailChat || !userId || !role) return;

    try {
      await updateGroupMemberRoles(groupDetailChat.id, {
        updates: [{ userId, role }],
      });
      await loadChatsFromApi();
      setApiError('');
    } catch (error) {
      setApiError(error.message || 'Gagal mengubah role member.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!groupDetailChat || !userId) return;

    try {
      await removeGroupMembers(groupDetailChat.id, { userIds: [userId] });
      await loadChatsFromApi();
      setApiError('');
    } catch (error) {
      setApiError(error.message || 'Gagal menghapus anggota group.');
    }
  };

  const handleLeaveActiveGroup = async () => {
    if (!groupDetailChat) return;

    try {
      await leaveGroup(groupDetailChat.id);
      await loadChatsFromApi();
      setIsGroupDetailModalOpen(false);
      setGroupDetailChatId('');
      setApiError('');
    } catch (error) {
      setApiError(error.message || 'Gagal keluar dari group.');
    }
  };

  const getMessageStatus = (message) => {
    if (message.sender_id !== currentUserId || !activeChat) return null;

    const receipts = receiptsByMessage[message.id] || [];
    const readerIds = new Set(receipts.map((receipt) => receipt.user_id));
    const recipients = activeParticipants.filter((participant) => participant.user_id !== currentUserId);
    const readCount = recipients.filter((participant) => readerIds.has(participant.user_id)).length;

    if (activeChat.type === 'PRIVATE') {
      return readCount > 0 ? 'read' : 'sent';
    }

    return readCount === recipients.length && recipients.length > 0 ? 'read' : 'sent';
  };

  const getSenderLabel = (message) => {
    if (message.sender_id === currentUserId) return 'You';
    return userMap[message.sender_id]?.username || 'Unknown';
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#e7e3f4] font-sans">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_#d9b8ff_0%,_#efe8ff_45%,_transparent_74%)]" />
      
      {/* Sidebar - Chat List */}
      <div className={`${isMobileListVisible ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[380px] lg:w-[420px] bg-[#f6f3ff] border-r border-[#d8cfee] z-10 transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#efebfb] border-b border-[#d8cfee] h-16 shrink-0">
          <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
            <img src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=MyUserAvatar'} alt="My Profile" className="w-10 h-10 rounded-full bg-[#dbd2f1] object-cover border border-[#cfc5e8] group-hover:ring-2 group-hover:ring-[#b7d62e] transition-all" />
            <span className="font-semibold text-[#23114b] hidden lg:block group-hover:text-[#5c4a88] transition-colors">{currentUser?.username || 'My Account'}</span>
          </Link>
          <div className="flex items-center gap-3 text-[#75669e]">
            <button
              onClick={() => setIsCreatePrivateModalOpen(true)}
              className="p-2 rounded-full hover:bg-[#e0d7f2] transition-colors"
              title="Create Private Chat"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCreateGroupModalOpen(true)}
              className="p-2 rounded-full hover:bg-[#e0d7f2] transition-colors"
              title="Create Group"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
            <Link to="/settings" className="p-2 rounded-full hover:bg-[#e0d7f2] transition-colors block" title="Settings">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#f6f3ff] border-b border-[#d8cfee] shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#ede7ff] border border-[#ddd4f2] rounded-xl text-sm text-[#23114b] focus:outline-none focus:ring-2 focus:ring-[#b7d62e] placeholder-[#7f72a5] transition-shadow"
            />
          </div>

          {isLoading && (
            <p className="mt-2 text-xs text-[#6f6195]">Memuat chat dari server...</p>
          )}

          {apiError && (
            <p className="mt-2 text-xs text-red-600">{apiError}</p>
          )}

          <p className={`mt-2 text-xs ${isSocketConnected ? 'text-green-700' : 'text-[#6f6195]'}`}>
            {isSocketConnected ? 'Realtime connected' : 'Realtime disconnected (REST fallback)'}
          </p>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => selectChat(chat)}
              className={`flex items-center px-4 py-3 cursor-pointer transition-colors border-b border-[#e5def5] ${activeChat?.id === chat.id ? 'bg-[#ece5ff]' : 'hover:bg-[#f0ebff]'}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.title} className="w-12 h-12 rounded-full bg-[#dbd2f1] object-cover" />
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f6f3ff] rounded-full"></div>
                )}
                {chat.type === 'GROUP' && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#f6f3ff] border border-[#d8cfee] flex items-center justify-center">
                    <Users className="w-3 h-3 text-[#6d5b99]" />
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-[#23114b] truncate">{chat.title}</h3>
                  <span className={`text-xs whitespace-nowrap ${chat.unread > 0 ? 'text-[#5b4b84] font-bold' : 'text-[#8a7db0]'}`}>
                    {chat.listTime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#8a7db0] truncate pr-2">
                    {chat.lastMessageText}
                  </p>
                  {chat.unread > 0 && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#b7d62e] flex items-center justify-center transition-all duration-300 transform scale-100">
                      <span className="text-[10px] font-bold text-[#23114b]">{chat.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className="p-6 text-center text-sm text-[#8a7db0]">
              Tidak ada chat yang cocok dengan pencarian.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!isMobileListVisible ? 'flex' : 'hidden'} md:flex flex-col flex-1 relative bg-[#ede9fb]`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_110%,_rgba(217,184,255,0.45),_transparent_45%)] pointer-events-none z-0"></div>

        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-[#f6f3ff] border-b border-[#d8cfee] h-16 shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden p-2 -ml-2 text-[#75669e] hover:bg-[#e0d7f2] rounded-full transition-colors"
                  onClick={() => setIsMobileListVisible(true)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeChat.type === 'GROUP') openGroupDetail(activeChat.id);
                  }}
                  className="relative"
                  title={activeChat.type === 'GROUP' ? 'Lihat detail group' : 'Profile chat'}
                >
                  <img src={activeChat.avatar} alt={activeChat.title} className="w-10 h-10 rounded-full bg-[#dbd2f1] object-cover" />
                  {activeChat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#f6f3ff] rounded-full"></div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeChat.type === 'GROUP') openGroupDetail(activeChat.id);
                  }}
                  className="flex flex-col text-left"
                  title={activeChat.type === 'GROUP' ? 'Lihat detail group' : 'Info chat'}
                >
                  <h2 className="font-semibold text-[#23114b] leading-tight">{activeChat.title}</h2>
                  <span className="text-xs text-[#6c5a98]">
                    {activeChat.type === 'GROUP'
                      ? `${activeParticipants.length} anggota`
                      : (activeChat.isOnline ? 'Online' : 'Offline')}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1 sm:gap-3 text-[#75669e]">
                {activeChat.type === 'GROUP' && currentUserRole === 'ADMIN' && (
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="p-2 rounded-full hover:bg-[#e0d7f2] transition-colors"
                    title="Tambah kontak ke group"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                )}
                <button className="hidden sm:block p-2 rounded-full hover:bg-[#e0d7f2] transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-[#e0d7f2] transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div className="flex justify-center mb-6">
                <span className="px-3 py-1 bg-[#e6ddf8] text-[#6f5f98] text-xs font-medium rounded-lg backdrop-blur-sm shadow-sm border border-[#d8cfee]">
                  TODAY
                </span>
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm relative group
                      ${msg.sender_id === currentUserId 
                        ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-tr-sm' 
                        : 'bg-[#f6f3ff] text-[#23114b] border border-[#d8cfee] rounded-tl-sm'
                      }`}
                  >
                    {activeChat.type === 'GROUP' && msg.sender_id !== currentUserId && (
                      <p className="text-[11px] font-semibold opacity-80 mb-1">
                        {getSenderLabel(msg)}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.iv
                        ? (decryptedMessages[msg.id] || 'Membuka pesan terenkripsi...')
                        : msg.content}
                    </p>
                    <div className={`mt-1.5 flex items-center gap-1 text-[10px] ${msg.sender_id === currentUserId ? 'text-primary-100/90' : 'text-gray-400'}`}>
                      <Lock className="w-3 h-3" />
                      <span>
                        {msg.iv
                          ? (decryptedMessages[msg.id] === FAILED_DECRYPT_TEXT ? 'Decrypt gagal' : 'Encrypted')
                          : 'Plain'}
                      </span>
                    </div>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender_id === currentUserId ? 'text-primary-100' : 'text-[#8a7db0]'} text-[10px]`}>
                      <span>{formatClock(msg.created_at)}</span>
                      {msg.sender_id === currentUserId && (
                        getMessageStatus(msg) === 'read'
                          ? <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                          : <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area (Text Only) */}
            <div className="relative z-10 p-3 bg-[#efebfb] border-t border-[#d8cfee] shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-5xl mx-auto">
                <div className="flex-1 bg-[#f6f3ff] border border-[#d8cfee] rounded-2xl flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-[#b7d62e]/60 focus-within:border-[#b7d62e] transition-all shadow-sm">
                  <textarea
                    rows={1}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      if (containsEmoji(nextValue)) {
                        setNewMessage(stripEmoji(nextValue));
                        setMessageError('Emoji tidak diizinkan. Gunakan teks saja.');
                        return;
                      }

                      setNewMessage(nextValue);
                      setMessageError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    className="w-full max-h-32 px-4 py-3 bg-transparent border-none text-sm focus:outline-none text-[#23114b] placeholder-[#8a7db0] resize-none custom-scrollbar"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-full transition-colors shadow-md flex-shrink-0 ${
                    newMessage.trim() 
                      ? 'bg-[#b7d62e] hover:bg-[#a9c629] text-[#23114b] shadow-[#b7d62e]/40' 
                      : 'bg-[#ddd4f2] text-[#9f93bf]'
                  }`}
                >
                  <Send className={`w-5 h-5 ${newMessage.trim() ? 'ml-0.5' : ''}`} />
                </button>
              </form>
              {messageError && (
                <p className="max-w-5xl mx-auto mt-2 text-xs text-red-600 px-1">{messageError}</p>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#ede9fb]/70">
            <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#7b64ba]/20 to-[#9b84de]/20 rounded-full mb-6 relative">
               <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                 <span className="text-white font-bold text-3xl">B</span>
               </div>
               {/* Decorative elements representing unread message clearing */}
               <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full shadow border-2 border-white flex items-center justify-center animate-bounce">
                 <span className="text-[10px] font-bold text-white text-center w-full block">3</span>
               </div>
            </div>
            <h2 className="text-2xl font-bold text-[#23114b] mb-2">BlockChat Web</h2>
            <p className="text-[#75669e] max-w-md">
              Send and receive purely text-based messages. Click any chat to read. 
            </p>
            <div className="mt-8 flex items-center gap-2 text-sm text-[#8a7db0]">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
               End-to-end encrypted text
            </div>
          </div>
        )}
      </div>

      {isCreatePrivateModalOpen && (
        <div className="absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#d8cfee] bg-[#f6f3ff] shadow-2xl">
            <div className="px-5 py-4 border-b border-[#e0d7f2] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#23114b]">Buat Private Chat</h3>
              <button
                onClick={() => {
                  setIsCreatePrivateModalOpen(false);
                  setSelectedPrivateUserId('');
                  setPrivateSearchQuery('');
                  setPrivateSearchResults([]);
                }}
                className="p-2 rounded-full hover:bg-[#e8e1f9]"
              >
                <X className="w-4 h-4 text-[#6b5a97]" />
              </button>
            </div>

            <form onSubmit={handleCreatePrivateChat} className="p-5 space-y-4">
              <p className="text-sm text-[#67558f]">Cari username lalu pilih pengguna untuk memulai private chat.</p>

              <div>
                <input
                  type="text"
                  value={privateSearchQuery}
                  onChange={(e) => setPrivateSearchQuery(e.target.value)}
                  placeholder="Cari username (min. 2 karakter)"
                  className="w-full px-3 py-2 rounded-xl border border-[#d8cfee] bg-white text-[#23114b] focus:outline-none focus:ring-2 focus:ring-[#b7d62e]"
                />
                {isSearchingPrivateUsers && (
                  <p className="mt-2 text-xs text-[#7b6ba2]">Mencari user...</p>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-[#ddd4f2] bg-white p-2 space-y-1">
                {privateChatCandidates.length === 0 && (
                  <p className="text-sm text-[#8a7db0] p-2">
                    {privateSearchQuery.trim().length >= 2
                      ? 'Username tidak ditemukan atau sudah ada private chat.'
                      : 'Semua kontak yang tersedia sudah punya private chat.'}
                  </p>
                )}

                {privateChatCandidates.map((user) => (
                  <label key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f1ecff] cursor-pointer">
                    <input
                      type="radio"
                      name="privateChatTarget"
                      value={user.id}
                      checked={selectedPrivateUserId === user.id}
                      onChange={(e) => setSelectedPrivateUserId(e.target.value)}
                    />
                    <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full bg-[#e5def7]" />
                    <div className="min-w-0">
                      <p className="text-sm text-[#23114b] truncate">{user.username}</p>
                      <p className="text-[11px] text-[#8a7db0] truncate">{user.email || 'Tanpa email'}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={!selectedPrivateUserId}
                className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${
                  selectedPrivateUserId
                    ? 'bg-[#b7d62e] text-[#23114b] hover:bg-[#a9c629]'
                    : 'bg-[#ddd4f2] text-[#9f93bf]'
                }`}
              >
                Mulai Private Chat
              </button>
            </form>
          </div>
        </div>
      )}

      {isCreateGroupModalOpen && (
        <div className="absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#d8cfee] bg-[#f6f3ff] shadow-2xl">
            <div className="px-5 py-4 border-b border-[#e0d7f2] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#23114b]">Buat Group Baru</h3>
              <button
                onClick={() => {
                  setIsCreateGroupModalOpen(false);
                  setNewGroupName('');
                  setNewGroupMembers([]);
                }}
                className="p-2 rounded-full hover:bg-[#e8e1f9]"
              >
                <X className="w-4 h-4 text-[#6b5a97]" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#67558f] mb-1">Nama Group</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8cfee] bg-white text-[#23114b] focus:outline-none focus:ring-2 focus:ring-[#b7d62e]"
                  placeholder="Contoh: Tim Product"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-[#67558f] mb-2">Pilih Kontak</p>
                <div className="max-h-60 overflow-y-auto rounded-xl border border-[#ddd4f2] bg-white p-2 space-y-1">
                  {contactsToCreateGroup.map((user) => {
                    const checked = newGroupMembers.includes(user.id);
                    return (
                      <label key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f1ecff] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setNewGroupMembers((prev) => (
                              e.target.checked
                                ? [...prev, user.id]
                                : prev.filter((id) => id !== user.id)
                            ));
                          }}
                        />
                        <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full bg-[#e5def7]" />
                        <span className="text-sm text-[#23114b]">{user.username}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newGroupName.trim() || newGroupMembers.length === 0}
                className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${
                  newGroupName.trim() && newGroupMembers.length > 0
                    ? 'bg-[#b7d62e] text-[#23114b] hover:bg-[#a9c629]'
                    : 'bg-[#ddd4f2] text-[#9f93bf]'
                }`}
              >
                Buat Group
              </button>
            </form>
          </div>
        </div>
      )}

      {isAddMemberModalOpen && activeChat && (
        <div className="absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#d8cfee] bg-[#f6f3ff] shadow-2xl">
            <div className="px-5 py-4 border-b border-[#e0d7f2] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#23114b]">Tambah Kontak ke Group</h3>
              <button
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setMembersToAdd([]);
                }}
                className="p-2 rounded-full hover:bg-[#e8e1f9]"
              >
                <X className="w-4 h-4 text-[#6b5a97]" />
              </button>
            </div>

            <form onSubmit={handleAddMembersToGroup} className="p-5 space-y-4">
              <p className="text-sm text-[#6a5a95]">Group: <span className="font-semibold text-[#23114b]">{activeChat.title}</span></p>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-[#ddd4f2] bg-white p-2 space-y-1">
                {addableUsers.length === 0 && (
                  <p className="text-sm text-[#8a7db0] p-2">Semua kontak sudah ada di group ini.</p>
                )}

                {addableUsers.map((user) => {
                  const checked = membersToAdd.includes(user.id);
                  return (
                    <label key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f1ecff] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setMembersToAdd((prev) => (
                            e.target.checked
                              ? [...prev, user.id]
                              : prev.filter((id) => id !== user.id)
                          ));
                        }}
                      />
                      <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full bg-[#e5def7]" />
                      <span className="text-sm text-[#23114b]">{user.username}</span>
                    </label>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={membersToAdd.length === 0}
                className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${
                  membersToAdd.length > 0
                    ? 'bg-[#b7d62e] text-[#23114b] hover:bg-[#a9c629]'
                    : 'bg-[#ddd4f2] text-[#9f93bf]'
                }`}
              >
                Tambahkan ke Group
              </button>
            </form>
          </div>
        </div>
      )}

      {isGroupDetailModalOpen && groupDetailChat && (
        <div className="absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#d8cfee] bg-[#f6f3ff] shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e0d7f2] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#23114b]">Detail Group</h3>
              <button
                onClick={() => {
                  setIsGroupDetailModalOpen(false);
                  setGroupDetailChatId('');
                  setEditedGroupName('');
                }}
                className="p-2 rounded-full hover:bg-[#e8e1f9]"
              >
                <X className="w-4 h-4 text-[#6b5a97]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={groupDetailChat.avatar}
                  alt={groupDetailChat.title}
                  className="w-12 h-12 rounded-full border border-[#d8cfee] bg-white"
                />
                <div>
                  <p className="font-semibold text-[#23114b]">{groupDetailChat.title}</p>
                  <p className="text-xs text-[#7a6aa4]">{groupDetailParticipants.length} anggota</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#ddd4f2] bg-white p-3 text-sm text-[#5e4f88] space-y-1">
                <p>
                  <span className="font-semibold">ID Chat:</span> {groupDetailChat.id}
                </p>
                <p>
                  <span className="font-semibold">Dibuat Oleh:</span> {groupCreator?.username || groupDetailChat.created_by}
                </p>
                <p>
                  <span className="font-semibold">Waktu Dibuat:</span> {formatDateTime(groupDetailChat.created_at)}
                </p>
              </div>

              {groupDetailCurrentUserRole === 'ADMIN' && (
                <div className="rounded-xl border border-[#ddd4f2] bg-white p-3 space-y-2">
                  <p className="text-sm font-semibold text-[#67558f]">Ubah Nama Group</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedGroupName}
                      onChange={(e) => setEditedGroupName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-[#d8cfee] bg-[#fdfcff] text-[#23114b] focus:outline-none focus:ring-2 focus:ring-[#b7d62e]"
                    />
                    <button
                      type="button"
                      onClick={handleRenameGroup}
                      disabled={!editedGroupName.trim()}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                        editedGroupName.trim()
                          ? 'bg-[#b7d62e] text-[#23114b] hover:bg-[#a9c629]'
                          : 'bg-[#ddd4f2] text-[#9f93bf]'
                      }`}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-[#67558f] mb-2">Member Group</p>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-[#ddd4f2] bg-white p-2 space-y-1">
                  {groupDetailParticipants.map((participant) => {
                    const user = userMap[participant.user_id];
                    return (
                      <div key={participant.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-[#f1ecff]">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=UnknownUser'}
                            alt={user?.username || participant.user_id}
                            className="w-8 h-8 rounded-full bg-[#e5def7]"
                          />
                          <div className="min-w-0">
                            <p className="text-sm text-[#23114b] truncate">{user?.username || participant.user_id}</p>
                            <p className="text-[11px] text-[#8a7db0]">Gabung: {formatDateTime(participant.joined_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {groupDetailCurrentUserRole === 'ADMIN' && participant.user_id !== currentUserId ? (
                            <select
                              value={participant.role}
                              onChange={(e) => handleChangeMemberRole(participant.user_id, e.target.value)}
                              className="text-[11px] px-2 py-1 rounded-lg border border-[#d8cfee] bg-[#f8f4ff] text-[#5e4f88]"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="MEMBER">MEMBER</option>
                            </select>
                          ) : (
                            <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${participant.role === 'ADMIN' ? 'bg-[#d9f0a5] text-[#40520b]' : 'bg-[#ece6ff] text-[#5e4f88]'}`}>
                              {participant.role}
                            </span>
                          )}

                          {groupDetailCurrentUserRole === 'ADMIN' && participant.user_id !== currentUserId && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(participant.user_id)}
                              className="text-[11px] px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLeaveActiveGroup}
                className="w-full py-2.5 rounded-xl font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              >
                Keluar dari Group
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
