import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Send, Paperclip, MoreVertical } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockMessages } from '../services/mockData';

export function Messages() {
  const [selectedChat, setSelectedChat] = useState(0);
  const [messageInput, setMessageInput] = useState('');

  const conversations = mockMessages.map(msg => ({
    id: msg.id,
    name: msg.name,
    lastMessage: msg.lastMessage,
    timestamp: msg.timestamp,
    unread: msg.unread ? 2 : 0,
    online: msg.id <= 2,
    avatar: msg.avatar,
  }));

  const messages = [
    { id: 1, sender: 'them', text: 'Hi! Thanks for your order. I\'ll start working on your logo design right away.', timestamp: '10:30 AM' },
    { id: 2, sender: 'me', text: 'Great! I\'m excited to see what you come up with. Here are some reference images.', timestamp: '10:32 AM' },
    { id: 3, sender: 'them', text: 'Perfect! I\'ll review these and create some initial concepts. Should have something for you by tomorrow.', timestamp: '10:35 AM' },
    { id: 4, sender: 'me', text: 'Sounds good. Looking forward to it!', timestamp: '10:36 AM' },
    { id: 5, sender: 'them', text: 'Thanks! I\'ll send you the final files soon', timestamp: '2 min ago' },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      // Handle message sending
      setMessageInput('');
    }
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
            {conversations.map((conv, index) => (
              <motion.button
                key={conv.id}
                onClick={() => setSelectedChat(index)}
                whileHover={{ backgroundColor: 'rgba(85, 185, 195, 0.1)' }}
                className={`w-full p-4 border-b border-border text-left transition-colors ${
                  selectedChat === index ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {conv.name.split(' ').map(n => n[0]).join('')}
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
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {conversations[selectedChat].name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {conversations[selectedChat].online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">{conversations[selectedChat].name}</h3>
                <p className="text-xs text-muted-foreground">
                  {conversations[selectedChat].online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.sender === 'me'
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
        </Card>
      </div>
    </div>
  );
}