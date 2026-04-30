import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Send, Paperclip, MoreVertical, MessageSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockMessages } from '../services/mockData';

export function Messages() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Record<number, { id: number; sender: string; text: string; timestamp: string }[]>>({});

  const conversations = mockMessages.map(msg => ({
    id: msg.id,
    name: msg.name,
    lastMessage: msg.lastMessage,
    timestamp: msg.timestamp,
    unread: msg.unread ? 2 : 0,
    online: false,
    avatar: msg.avatar,
  }));

  const activeConversation = conversations.find(c => c.id === selectedChatId) ?? null;
  const messages = selectedChatId ? (localMessages[selectedChatId] ?? []) : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageInput.trim();
    if (!text) return;

    const newMessage = {
      id: (localMessages[selectedChatId]?.length ?? 0) + 1,
      sender: 'me',
      text,
      timestamp: 'Just now',
    };

    setLocalMessages(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] ?? []), newMessage],
    }));
    setMessageInput('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Communicate with buyers and sellers</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
        {/* Conversations List */}
        <Card className="lg:col-span-4 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
                <MessageSquare className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
              </div>
            ) : conversations.map((conv) => (
              <motion.button
                key={conv.id}
                onClick={() => setSelectedChatId(conv.id)}
                whileHover={{ backgroundColor: 'rgba(85, 185, 195, 0.1)' }}
                className={`w-full p-4 border-b border-border text-left transition-colors ${selectedChatId === conv.id ? 'bg-accent' : ''
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {(conv.name || '').split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold truncate">{conv.name}</h4>
                      <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      {conv.unread > 0 && (
                        <Badge variant="default" className="ml-2">{conv.unread}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-8 flex flex-col">
          {!activeConversation ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-20 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-lg font-semibold mb-1">No conversation selected</p>
              <p className="text-sm">Select a conversation from the list to start messaging.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {(activeConversation.name || '').split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {activeConversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{activeConversation.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {activeConversation.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-10">No messages yet. Say hello!</p>
                ) : messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%]`}>
                      <div
                        className={`p-4 rounded-2xl ${message.sender === 'me'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                          }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-2">
                        {message.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button type="submit">
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}