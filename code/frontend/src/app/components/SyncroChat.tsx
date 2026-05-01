import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { MessageCircle, X, Send, Bot, Sparkles, ArrowRight, Gavel } from 'lucide-react';
import { Button } from './ui/Button';
import { useApp } from '../context/AppContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
    isBidWorthy?: boolean;
}

// ──────────────────────────────────────────────────────────────
// Real AI API call
// ──────────────────────────────────────────────────────────────

async function callAI(
    conversation: { role: string; content: string }[],
    token: string
): Promise<{ status: string; message: string; bid_request_id?: number; order?: Record<string, string> }> {
    const res = await fetch(`${API_BASE}/chat/rfp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversation }),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ──────────────────────────────────────────────────────────────
// TypingDots component
// ──────────────────────────────────────────────────────────────

function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted-foreground/50"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
            ))}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────
// ChatMessage component
// ──────────────────────────────────────────────────────────────

function ChatMessage({ message, onBidClick }: { message: Message; onBidClick: () => void }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
        >
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mb-1">
                    <Bot className="w-3.5 h-3.5 text-white" />
                </div>
            )}

            <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={
                        isUser
                            ? 'rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed bg-primary text-white shadow-sm'
                            : 'rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed bg-muted text-foreground shadow-sm'
                    }
                    style={{ whiteSpace: 'pre-line' }}
                    dangerouslySetInnerHTML={{
                        __html: message.text
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n•/g, '<br/>•'),
                    }}
                />
                {!isUser && message.isBidWorthy && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 w-full"
                    >
                        <Button
                            variant="primary"
                            size="sm"
                            className="w-full bg-white text-primary border border-primary/20 hover:bg-primary/5 shadow-sm"
                            onClick={onBidClick}
                        >
                            <Gavel className="w-3.5 h-3.5 mr-2" />
                            Create Formal Bid Request
                        </Button>
                    </motion.div>
                )}
                <span className="text-[10px] text-muted-foreground px-1">{formatTime(message.timestamp)}</span>
            </div>
        </motion.div>
    );
}

// ──────────────────────────────────────────────────────────────
// Main SyncroChat Component
// ──────────────────────────────────────────────────────────────

export function SyncroChat({
    showFloatingButton = true,
    showInlineTrigger = false
}: {
    showFloatingButton?: boolean;
    showInlineTrigger?: boolean;
}) {
    const { isChatOpen: isOpen, setIsChatOpen: setIsOpen, authUser } = useApp();
    const navigate = useNavigate();
    // conversation history sent to the AI (excludes the welcome message)
    const [aiHistory, setAiHistory] = useState<{ role: string; content: string }[]>([]);
    const [isDone, setIsDone] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'bot',
            text: "👋 Hi! I'm **Syncro Assistant**.\n\nDescribe what you need and I'll help you find the right local service or product.",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = useCallback(async () => {
        const text = inputValue.trim();
        if (!text || isTyping || isDone) return;

        if (!authUser?.token) {
            setMessages((prev) => [...prev, {
                id: `err-${Date.now()}`, role: 'bot',
                text: '⚠️ You must be logged in to use the AI assistant.',
                timestamp: new Date(),
            }]);
            return;
        }

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            text,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Build updated history (skip the initial welcome message)
        const updatedHistory = [...aiHistory, { role: 'user', content: text }];
        setAiHistory(updatedHistory);

        try {
            const result = await callAI(updatedHistory, authUser.token);

            const botMsg: Message = {
                id: `bot-${Date.now()}`,
                role: 'bot',
                text: result.message,
                isBidWorthy: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setAiHistory((prev) => [...prev, { role: 'assistant', content: result.message }]);

            if (result.status === 'complete' && result.bid_request_id) {
                setIsDone(true);
                setTimeout(() => {
                    setIsOpen(false);
                    navigate(`/bids/${result.bid_request_id}`);
                }, 2000);
            }
        } catch (error: any) {
            let errorMsg = '⚠️ Could not reach the AI server. Make sure the SSH tunnel is running.';
            if (error instanceof Error && error.message.includes('401')) {
                errorMsg = '⚠️ Your session has expired or is invalid. Please log out and log back in.';
            }
            setMessages((prev) => [...prev, {
                id: `err-${Date.now()}`, role: 'bot',
                text: errorMsg,
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }
    }, [inputValue, isTyping, isDone, aiHistory, authUser, navigate, setIsOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleCreateBidRequest = () => {
        navigate('/bids');
    };

    return (
        <>
            {/* ── 1. Integrated Assistant Section (for Card Row) ── */}
            {showInlineTrigger && (
                <div className="flex flex-col items-start gap-6 w-full lg:flex-row lg:items-center lg:justify-between group">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shadow-sm transform translate-y-3">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-2xl font-bold tracking-tight">Ask Syncro Assistant</h3>
                                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 animate-pulse uppercase tracking-wider">
                                        AI Helper
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                            Need something done? Describe your needs here and Syncro Assistant will guide you to the best service.
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <Button
                            onClick={() => setIsOpen(true)}
                            size="lg"
                            className="bg-[#0091C2] hover:bg-[#007EA8] shadow-md px-6 py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-none text-white font-semibold min-w-[200px]"
                        >
                            <MessageCircle className="w-5 h-5 mr-3 text-white" />
                            Describe Your Need
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

            )}

            {/* ── 2. Floating Trigger Button (Bottom-Right) ── */}
            <AnimatePresence>
                {showFloatingButton && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed bottom-6 right-6 z-50 pointer-events-auto"
                    >
                        <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                        />

                        <button
                            onClick={() => setIsOpen(true)}
                            className="relative w-[52px] h-[52px] rounded-full bg-[#0091C2] flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-200"
                            aria-label="Open Syncro Assistant"
                        >
                            <MessageCircle className="w-6 h-6" />
                            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#00D084] border-2 border-white rounded-full transform translate-x-1 -translate-y-0.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 3. Chat Window (Center Modal) ── */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className="relative w-full max-w-[440px] flex flex-col overflow-hidden bg-card border border-border shadow-2xl rounded-2xl"
                            style={{ maxHeight: 'calc(100vh - 80px)' }}
                        >
                            <div className="bg-gradient-to-br from-primary to-accent p-5 text-white">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold flex items-center gap-1.5 leading-none">
                                                Syncro Assistant
                                                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                            </h3>
                                            <p className="text-white/80 text-xs mt-1">Tell us what you need and we'll help you.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-[380px] max-h-[500px]">
                                {messages.map((msg) => (
                                    <ChatMessage key={msg.id} message={msg} onBidClick={handleCreateBidRequest} />
                                ))}
                                {isTyping && (
                                    <div className="flex items-end gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mb-1">
                                            <Bot className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div className="bg-muted rounded-2xl rounded-bl-sm shadow-sm">
                                            <TypingDots />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t border-border bg-muted/30">
                                <div className="flex items-end gap-2 bg-card border border-border rounded-xl p-2.5 focus-within:ring-2 ring-primary/20 transition-all shadow-sm">
                                    <textarea
                                        ref={inputRef}
                                        rows={1}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={isDone ? '✅ Request sent! Redirecting to your bids...' : 'Describe your need...'}
                                        disabled={isDone}
                                        className="flex-1 bg-transparent resize-none text-sm py-1.5 focus:outline-none disabled:opacity-50"
                                        style={{ maxHeight: '120px' }}
                                        onInput={(e) => {
                                            const t = e.currentTarget;
                                            t.style.height = 'auto';
                                            t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                                        }}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputValue.trim() || isTyping || isDone}
                                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-all font-medium"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60 font-medium">
                                    Syncro Assistant AI · Always Online
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
