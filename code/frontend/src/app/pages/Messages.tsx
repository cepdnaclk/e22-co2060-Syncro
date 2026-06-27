import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, MessageSquare, ArrowLeft, Check, CheckCheck, Plus, X, Users } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { messagesApi, profilesApi, ConversationSummary, Message, SellerSummary } from '../services/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

// Group messages by date for date-separator labels
function groupByDate(msgs: Message[]): { label: string; messages: Message[] }[] {
  const groups: { label: string; messages: Message[] }[] = [];
  msgs.forEach((msg) => {
    const label = formatDateLabel(msg.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.messages.push(msg);
    } else {
      groups.push({ label, messages: [msg] });
    }
  });
  return groups;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]?.toUpperCase() ?? '').join('').slice(0, 2) || '?';
}

// ─── New Message Picker Panel ────────────────────────────────────────────────

interface NewMessagePanelProps {
  onSelectSeller: (userId: number, name: string) => void;
  onClose: () => void;
}

function NewMessagePanel({ onSelectSeller, onClose }: NewMessagePanelProps) {
  const [sellers, setSellers] = useState<SellerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    profilesApi.listSellers()
      .then(setSellers)
      .catch(() => setSellers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sellers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.display_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 z-10 bg-card flex flex-col rounded-xl shadow-xl border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Start New Conversation</h3>
        </div>
        <button
          id="close-new-message-panel"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="seller-search-input"
            type="text"
            placeholder="Search sellers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
      </div>

      {/* Sellers list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 p-3 rounded-lg animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2.5 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-6">
            <Users className="w-8 h-8 text-muted-foreground opacity-30 mb-3" />
            <p className="text-sm font-medium">
              {search ? 'No sellers found' : 'No sellers available'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? 'Try a different search term' : 'Visit a seller\'s profile to message them directly'}
            </p>
          </div>
        ) : (
          filtered.map(seller => (
            <motion.button
              key={seller.user_id}
              id={`seller-pick-${seller.user_id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => onSelectSeller(seller.user_id, seller.name)}
              className="w-full p-4 border-b border-border text-left flex items-center gap-3 hover:bg-accent/60 transition-colors"
            >
              {/* Avatar */}
              {seller.logo ? (
                <img src={seller.logo} alt={seller.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {getInitials(seller.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{seller.name}</p>
                {seller.description && (
                  <p className="text-xs text-muted-foreground truncate">{seller.description}</p>
                )}
              </div>
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Messages() {
  const { authUser, socketOn, clearUnreadMessages } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Conversation sidebar state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);

  // Active chat state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  // Mobile: show chat panel instead of list
  const [showChat, setShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Load conversations on mount ──────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setConvLoading(true);
    try {
      const data = await messagesApi.getConversations();
      setConversations(data);
    } catch (e) {
      console.error('Failed to load conversations', e);
    } finally {
      setConvLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    // Clear the global unread badge (sidebar blue dot) when the Messages page opens
    clearUnreadMessages();
  }, [loadConversations, clearUnreadMessages]);

  // Keep a ref to selectedUserId so the polling closure always sees the latest value
  const selectedUserIdRef = useRef<number | null>(null);
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  // Tracks WHEN markRead was last called for each conversation (userId -> timestamp).
  // Used in the 5s poll to suppress stale server unread counts for a short window
  // (markRead is async; the server may still return the old count for 1-2 seconds).
  // After READ_PROTECTION_MS the server is trusted again, so new genuine messages show.
  const recentlyReadTimestampRef = useRef<Map<number, number>>(new Map());
  const READ_PROTECTION_MS = 8000; // 8 s > one poll cycle (5 s) gives safe margin

  // ── Periodic sidebar refresh (every 5s) ─────────────────────────────────
  // Keeps unread counts and last-message previews current. We merge server data
  // with local state: take the HIGHER unread_count so a socket bump is never
  // overwritten by a stale server response. The active conversation is always 0.
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const data = await messagesApi.getConversations();
        const activeId = selectedUserIdRef.current;
        setConversations(prev => {
          const merged = data.map((serverConv: any) => {
            if (serverConv.other_user_id === activeId) {
              // Active conversation: always show as read
              return { ...serverConv, unread_count: 0 };
            }
            // For all others: keep whichever unread count is higher (server vs local).
            // BUT within READ_PROTECTION_MS of calling markRead, trust local 0 over
            // the server's possibly-stale count (markRead is async).
            // After that window, the server is the source of truth for new messages.
            const localConv = prev.find(c => c.other_user_id === serverConv.other_user_id);
            const localUnread = localConv?.unread_count ?? 0;
            const lastReadAt = recentlyReadTimestampRef.current.get(serverConv.other_user_id);
            const isProtected = lastReadAt !== undefined && (Date.now() - lastReadAt < READ_PROTECTION_MS);
            if (isProtected && localUnread === 0) {
              // Still within protection window: trust local read state over stale server data
              return { ...serverConv, unread_count: 0 };
            }
            return { ...serverConv, unread_count: Math.max(serverConv.unread_count, localUnread) };
          });
          const changed = JSON.stringify(merged) !== JSON.stringify(prev);
          return changed ? merged : prev;
        });
      } catch { /* silent */ }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ── Handle ?userId=X&name=Y query param (coming from SellerProfile / BidDetail) ──
  useEffect(() => {
    const qUserId = searchParams.get('userId');
    const qName = searchParams.get('name') || 'User';
    if (qUserId) {
      const id = parseInt(qUserId, 10);
      openConversation(id, qName);
      // Clear URL params so back navigation is clean
      setSearchParams({}, { replace: true });
    }
  }, []); // run once on mount

  // ── Select & load a conversation ────────────────────────────────────────
  const openConversation = useCallback(async (userId: number, name: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(name);
    setMessages([]);
    setMsgsLoading(true);
    setShowChat(true);
    setShowNewMessage(false);

    // Record when we called markRead so the 5s poll can ignore stale server responses
    recentlyReadTimestampRef.current.set(userId, Date.now());

    try {
      const [history] = await Promise.all([
        messagesApi.getHistory(userId),
        messagesApi.markRead(userId),
      ]);
      setMessages(history);
      // Clear unread badge on the sidebar entry
      setConversations(prev =>
        prev.map(c => c.other_user_id === userId ? { ...c, unread_count: 0 } : c)
      );
    } catch (e) {
      console.error('Failed to load conversation', e);
    } finally {
      setMsgsLoading(false);
    }
  }, []);

  // ── Auto-scroll to bottom whenever messages update ───────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastReadRef = useRef<number>(0);

  // ── Real-time: listen for incoming messages ──────────────────────────────
  useEffect(() => {
    const unsub = socketOn('new_message', (data: Message) => {
      const otherId =
        data.sender_id === authUser?.userId ? data.receiver_id : data.sender_id;

      // If this message belongs to the active conversation, append it and mark read
      if (
        selectedUserId !== null &&
        (data.sender_id === selectedUserId || data.receiver_id === selectedUserId)
      ) {
        setMessages(prev => {
          // Avoid duplicates (the echo back to sender might arrive twice in dev)
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });

        // Auto-mark as read since the user is actively viewing this chat
        if (data.sender_id === selectedUserId) {
          messagesApi.markRead(selectedUserId).catch(() => {});
        }
      }

      // Update sidebar: bump last_message and unread count.
      // The socket is real-time so we always apply its data immediately —
      // no recentlyRead check here. A new message trumps any protection.
      setConversations(prev => {
        const exists = prev.find(c => c.other_user_id === otherId);
        // Suppress badge only if this IS the currently open conversation
        const isActiveConv = selectedUserId === otherId;
        const newUnread = isActiveConv
          ? 0
          : (exists?.unread_count ?? 0) + (data.sender_id !== authUser?.userId ? 1 : 0);

        if (exists) {
          return [
            { ...exists, last_message: data.content, last_message_time: data.timestamp, unread_count: newUnread },
            ...prev.filter(c => c.other_user_id !== otherId),
          ];
        }
        // New conversation partner — reload full list
        loadConversations();
        return prev;
      });
    });

    // Listen for read receipts (when the other user reads our messages)
    const unsubRead = socketOn('messages_read', (data: { reader_id: number }) => {
      if (selectedUserId === data.reader_id) {
        lastReadRef.current = Date.now();
        setMessages(prev =>
          prev.map(m =>
            m.sender_id === authUser?.userId && !m.is_read
              ? { ...m, is_read: true }
              : m
          )
        );
      }
    });

    return () => {
      unsub();
      unsubRead();
    };
  }, [socketOn, selectedUserId, authUser?.userId, loadConversations]);

  // ── Polling fallback: refresh messages every 3s while conversation is open ─
  // Guarantees messages appear even if the socket hiccups, AND keeps is_read
  // status current so the sender sees double-blue ticks when receiver reads.
  useEffect(() => {
    if (!selectedUserId) return;

    const poll = async () => {
      try {
        const history = await messagesApi.getHistory(selectedUserId);
        let hasFresh = false;
        setMessages(prev => {
          // Build a map of server messages for quick lookup
          const serverById = new Map<string, Message>(history.map((m: Message) => [m.id, m]));

          // 1. Update is_read on existing messages (false → true)
          //    This makes the sender's single tick become double-blue tick.
          const updated = prev.map(m => {
            const serverMsg = serverById.get(m.id);
            if (serverMsg && !m.is_read && serverMsg.is_read) {
              return { ...m, is_read: true };
            }
            return m;
          });

          // 2. Append genuinely new messages
          const existingIds = new Set(prev.map(m => m.id));
          const fresh = history.filter((m: Message) => !existingIds.has(m.id));
          if (fresh.length > 0) hasFresh = true;

          const hasReadUpdates = updated.some((m, i) => m.is_read !== prev[i]?.is_read);
          if (!hasFresh && !hasReadUpdates) return prev;
          return [...updated, ...fresh];
        });

        // If new messages arrived, mark them read (user is actively in this conversation)
        if (hasFresh) {
          messagesApi.markRead(selectedUserId).catch(() => {});
          setConversations(prev =>
            prev.map(c =>
              c.other_user_id === selectedUserId ? { ...c, unread_count: 0 } : c
            )
          );
        }
      } catch { /* silent */ }
    };

    const timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [selectedUserId]);

  // ── Send a message ───────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !selectedUserId || sending) return;

    setSending(true);
    setInput('');

    try {
      const sent = await messagesApi.send(selectedUserId, text);
      const isInstantlyRead = (Date.now() - lastReadRef.current) < 5000;
      
      // Optimistically insert — the socket echo from server will be deduplicated
      setMessages(prev => {
        if (prev.some(m => m.id === sent.id)) {
          // Socket echo already appended it. Make sure read state is correct.
          return prev.map(m => m.id === sent.id && isInstantlyRead ? { ...m, is_read: true } : m);
        }
        return [...prev, { ...sent, is_read: sent.is_read || isInstantlyRead }];
      });
      // Bump sidebar last_message
      setConversations(prev => {
        const exists = prev.find(c => c.other_user_id === selectedUserId);
        if (exists) {
          return [
            { ...exists, last_message: sent.content, last_message_time: sent.timestamp },
            ...prev.filter(c => c.other_user_id !== selectedUserId),
          ];
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to send message', err);
      setInput(text); // restore input if send failed
    } finally {
      setSending(false);
    }
  };

  // ── Filtered conversations (sidebar search) ──────────────────────────────
  const filteredConvs = conversations.filter(c =>
    c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = groupByDate(messages);
  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0);

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] space-y-0">
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Communicate with buyers and sellers in real time
          </p>
        </div>
        {totalUnread > 0 && (
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            {totalUnread} unread
          </span>
        )}
      </div>

      <div className="flex-1 grid lg:grid-cols-12 gap-0 rounded-xl overflow-hidden border border-border shadow-sm bg-card min-h-0">

        {/* ── Conversations Sidebar ─────────────────────────────────────── */}
        <div className={`lg:col-span-4 flex flex-col border-r border-border relative ${showChat ? 'hidden lg:flex' : 'flex'}`}>
          {/* Search + New Message button */}
          <div className="p-4 border-b border-border bg-muted/30 shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  id="messages-search"
                  placeholder="Search conversations…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
              <motion.button
                id="new-message-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewMessage(v => !v)}
                title="New Message"
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${showNewMessage ? 'bg-primary text-primary-foreground' : 'bg-background border border-border hover:bg-accent'}`}
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <div className="space-y-1 p-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-2.5 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <p className="font-semibold text-sm">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Click the <strong>+</strong> button above to message a seller, or visit a seller's profile.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNewMessage(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Start a Conversation
                </motion.button>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredConvs.map(conv => (
                  <motion.button
                    key={conv.other_user_id}
                    id={`conv-${conv.other_user_id}`}
                    onClick={() => openConversation(conv.other_user_id, conv.other_user_name)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`w-full p-4 border-b border-border text-left flex items-start gap-3 transition-colors hover:bg-accent/60 ${
                      selectedUserId === conv.other_user_id ? 'bg-accent/80 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                        {conv.other_user_initials}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold' : 'font-medium'}`}>
                          {conv.other_user_name}
                        </h4>
                        <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                          {formatTime(conv.last_message_time)}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${conv.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {conv.last_message}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* New Message overlay panel */}
          <AnimatePresence>
            {showNewMessage && (
              <NewMessagePanel
                onSelectSeller={(userId, name) => {
                  openConversation(userId, name);
                  setShowNewMessage(false);
                }}
                onClose={() => setShowNewMessage(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Chat Area ──────────────────────────────────────────────────── */}
        <div className={`lg:col-span-8 flex flex-col min-h-0 ${showChat ? 'flex' : 'hidden lg:flex'}`}>

          {!selectedUserId ? (
            // Empty state
            <div className="flex flex-col items-center justify-center flex-1 text-center p-10 text-muted-foreground">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5">
                <MessageSquare className="w-10 h-10 text-primary opacity-60" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Select a conversation</h3>
              <p className="text-sm max-w-xs mb-5">
                Choose a conversation from the list, or start a new one by clicking the <strong>+</strong> button.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNewMessage(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Message
              </motion.button>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20 shrink-0">
                <button
                  id="back-to-conversations"
                  className="lg:hidden p-1 rounded-lg hover:bg-accent transition-colors mr-1"
                  onClick={() => {
                    // Reset selectedUserId to null so the socket handler treats
                    // any incoming messages for this conversation as unread.
                    // We do NOT call loadConversations() here — that caused a race condition
                    // where stale server data (markRead not yet processed) overwrote our
                    // correct local unread_count=0. The 5s polling handles syncing.
                    setSelectedUserId(null);
                    setShowChat(false);
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {getInitials(selectedUserName)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm leading-tight">{selectedUserName}</h3>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
                {msgsLoading ? (
                  <div className="space-y-3 py-4">
                    {[1, 2, 3, 4].map((i, idx) => (
                      <div key={i} className={`flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`h-10 rounded-2xl animate-pulse bg-muted ${idx % 2 === 0 ? 'w-48' : 'w-36'}`} />
                      </div>
                    ))}
                  </div>
                ) : groups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <MessageSquare className="w-6 h-6 text-muted-foreground opacity-40" />
                    </div>
                    <p className="text-sm text-muted-foreground">No messages yet — say hello! 👋</p>
                  </div>
                ) : (
                  groups.map(group => (
                    <div key={group.label}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground bg-card px-2">{group.label}</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* Messages in this group */}
                      <div className="space-y-2">
                        {group.messages.map((msg, idx) => {
                          const isMine = msg.sender_id === authUser?.userId;
                          const prevMsg = group.messages[idx - 1];
                          const showAvatar = !isMine && (!prevMsg || prevMsg.sender_id !== msg.sender_id);

                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              {/* Receiver avatar placeholder */}
                              {!isMine && (
                                <div className={`w-7 h-7 rounded-full shrink-0 ${showAvatar ? 'bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[10px] font-bold' : 'invisible'}`}>
                                  {showAvatar && getInitials(selectedUserName)}
                                </div>
                              )}

                              <div className={`max-w-[70%] group`}>
                                <div
                                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    isMine
                                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                                      : 'bg-muted text-foreground rounded-bl-sm'
                                  }`}
                                >
                                  {msg.content}
                                </div>
                                <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatTime(msg.timestamp)}
                                  </span>
                                  {isMine && (
                                    <CheckCheck className={`w-3.5 h-3.5 ${msg.is_read ? 'text-primary' : 'text-muted-foreground'}`} />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="px-4 py-3 border-t border-border bg-muted/10 shrink-0">
                <form id="message-send-form" onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    id="message-input"
                    type="text"
                    placeholder="Type a message…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition disabled:opacity-60"
                    autoComplete="off"
                  />
                  <button
                    id="message-send-btn"
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 transition hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}