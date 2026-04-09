import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Shield } from 'lucide-react';
import { STORAGE_KEYS, getStoredUsers } from '../data/mockData';
import { decryptMessage, getRoomSecret } from '../utils/cryptoChat';

function formatDateTime(isoDate) {
  return new Date(isoDate).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function EncryptionPreview() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [decryptedById, setDecryptedById] = useState({});

  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || 'null');
  const allUsers = getStoredUsers();

  const data = useMemo(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.chatState);

    if (!raw) {
      return {
        parseError: '',
        encryptedMessages: [],
      };
    }

    try {
      const parsed = JSON.parse(raw);
      const chats = Array.isArray(parsed.chats) ? parsed.chats : [];
      const messages = Array.isArray(parsed.messages) ? parsed.messages : [];

      const chatNameById = {};
      chats.forEach((chat) => {
        chatNameById[chat.id] = chat.type === 'GROUP'
          ? (chat.name || 'Untitled Group')
          : 'Private Chat';
      });

      const userById = {};
      allUsers.forEach((user) => {
        userById[user.id] = user;
      });

      const encryptedMessages = messages
        .filter((message) => Boolean(message.iv && message.content))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((message) => ({
          ...message,
          chatName: chatNameById[message.chat_id] || 'Unknown Chat',
          senderName: userById[message.sender_id]?.username || message.sender_id,
        }));

      return {
        parseError: '',
        encryptedMessages,
      };
    } catch (error) {
      return {
        parseError: 'Data chat di localStorage tidak valid JSON.',
        encryptedMessages: [],
      };
    }
  }, [allUsers, refreshKey]);

  useEffect(() => {
    let isCancelled = false;

    const decryptAll = async () => {
      const nextDecrypted = {};

      for (const message of data.encryptedMessages) {
        try {
          const plainText = await decryptMessage(
            { iv: message.iv, cipher: message.content },
            getRoomSecret(message.chat_id, currentUser?.id || 'guest'),
          );
          nextDecrypted[message.id] = plainText;
        } catch (error) {
          nextDecrypted[message.id] = '[Gagal decrypt dengan secret user saat ini]';
        }
      }

      if (!isCancelled) {
        setDecryptedById(nextDecrypted);
      }
    };

    decryptAll();

    return () => {
      isCancelled = true;
    };
  }, [currentUser?.id, data.encryptedMessages]);

  return (
    <div className="min-h-screen bg-[#e7e3f4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 text-[#6e6093] hover:bg-[#d8cfee] rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#23114b]">Temporary Encryption Viewer</h1>
              <p className="text-sm text-[#6f6192]">Menampilkan bentuk ciphertext + iv dari pesan terenkripsi.</p>
            </div>
          </div>

          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f6f3ff] border border-[#d8cfee] px-4 py-2 text-sm font-semibold text-[#4f4177] hover:bg-[#efe9ff]"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-[#d8cfee] bg-[#f6f3ff] p-4 text-sm text-[#584a80]">
          <p><span className="font-semibold">User aktif:</span> {currentUser?.username || 'guest'}</p>
          <p className="mt-1"><span className="font-semibold">Total pesan terenkripsi:</span> {data.encryptedMessages.length}</p>
        </div>

        {data.parseError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {data.parseError}
          </div>
        )}

        <div className="space-y-4">
          {data.encryptedMessages.map((message) => (
            <div key={message.id} className="rounded-2xl border border-[#d8cfee] bg-[#f6f3ff] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-[#23114b]">{message.chatName}</p>
                  <p className="text-xs text-[#7e71a3]">Sender: {message.senderName} • {formatDateTime(message.created_at)}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#d7eea1] text-[#41540b] px-2.5 py-1 text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  ENCRYPTED
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-[#5f5189] mb-1">Ciphertext (content)</p>
                  <pre className="rounded-lg border border-[#e0d7f2] bg-white p-2 text-xs text-[#3f3363] overflow-x-auto whitespace-pre-wrap break-all">{message.content}</pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#5f5189] mb-1">IV</p>
                  <pre className="rounded-lg border border-[#e0d7f2] bg-white p-2 text-xs text-[#3f3363] overflow-x-auto whitespace-pre-wrap break-all">{message.iv}</pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#5f5189] mb-1">Hasil decrypt (preview)</p>
                  <pre className="rounded-lg border border-[#e0d7f2] bg-white p-2 text-xs text-[#3f3363] overflow-x-auto whitespace-pre-wrap break-all">{decryptedById[message.id] || 'Membuka data...'}</pre>
                </div>
              </div>
            </div>
          ))}

          {data.encryptedMessages.length === 0 && !data.parseError && (
            <div className="rounded-2xl border border-[#d8cfee] bg-[#f6f3ff] p-6 text-sm text-[#75669e] text-center">
              Belum ada pesan terenkripsi yang tersimpan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
