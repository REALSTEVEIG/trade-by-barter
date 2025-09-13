'use client';

import * as React from 'react';
import { Send, Paperclip, Search, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loading } from '@/components/ui/loading';
import Header from '@/components/layout/header';
import { useAuth, withAuth } from '@/contexts/auth-context';
import { Chat, Message } from '@/types';
import { formatTimeAgo, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data for development
const mockChats: Chat[] = [
  {
    id: '1',
    participants: [
      {
        id: '2',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: '',
        bio: '',
        isVerified: true,
        rating: 4.8,
        totalTrades: 15,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
    ],
    lastMessage: {
      id: '1',
      chatId: '1',
      senderId: '2',
      content: 'Hey, is the iPhone still available?',
      type: 'text',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      updatedAt: new Date(),
    },
    unreadCount: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    participants: [
      {
        id: '3',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: '',
        bio: '',
        isVerified: true,
        rating: 4.9,
        totalTrades: 32,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
    ],
    lastMessage: {
      id: '2',
      chatId: '2',
      senderId: '1',
      content: 'Thanks for the trade!',
      type: 'text',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      updatedAt: new Date(),
    },
    unreadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    chatId: '1',
    senderId: '2',
    content: 'Hey, is the iPhone still available?',
    type: 'text',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    updatedAt: new Date(),
  },
  {
    id: '2',
    chatId: '1',
    senderId: '1',
    content: 'Yes, it is! Are you interested?',
    type: 'text',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
    updatedAt: new Date(),
  },
  {
    id: '3',
    chatId: '1',
    senderId: '2',
    content: 'Definitely! Can we meet up?',
    type: 'text',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    updatedAt: new Date(),
  },
  {
    id: '4',
    chatId: '1',
    senderId: '1',
    content: 'Sure! How about tomorrow at 2 PM?',
    type: 'text',
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
    updatedAt: new Date(),
  },
];

function ChatPageComponent(): React.ReactElement {
  const { user } = useAuth();
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Transform user data for Header component
  const headerUser = user ? {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    ...(user.avatar && { avatar: user.avatar }),
  } : undefined;

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = React.useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // For development, use mock data
      // const response = await chatApi.getChats();
      // setChats(response.data as Chat[]);
      setChats(mockChats);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = React.useCallback(async (chatId: string): Promise<void> => {
    try {
      setMessagesLoading(true);
      // For development, use mock data
      // const response = await chatApi.getMessages(chatId);
      // setMessages(response.data as Message[]);
      setMessages(mockMessages.filter(m => m.chatId === chatId));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  React.useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat, fetchMessages]);

  const handleChatSelect = (chat: Chat): void => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat || sending) return;

    try {
      setSending(true);

      // For development, add message locally
      const newMsg: Message = {
        id: Date.now().toString(),
        chatId: selectedChat.id,
        senderId: user!.id,
        content: newMessage.trim(),
        type: 'text',
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

      // In production, use:
      // await chatApi.sendMessage(messageData);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-neutral-gray" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-neutral-gray" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const otherParticipant = chat.participants.find(p => p.id !== user?.id);
    return otherParticipant?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant?.lastName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background-light">
      <Header user={headerUser} />

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-border-gray overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Chat List Sidebar */}
            <div className="w-1/3 border-r border-border-gray flex flex-col">
              {/* Search Header */}
              <div className="p-4 border-b border-border-gray">
                <h2 className="heading-2 mb-3">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-gray" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loading size="md" />
                  </div>
                ) : filteredChats.length > 0 ? (
                  <div className="space-y-1">
                    {filteredChats.map((chat) => {
                      const otherParticipant = chat.participants.find(p => p.id !== user?.id);
                      if (!otherParticipant) return null;

                      return (
                        <div
                          key={chat.id}
                          className={cn(
                            'flex items-center gap-3 p-4 hover:bg-neutral-50 cursor-pointer transition-colors',
                            selectedChat?.id === chat.id && 'bg-blue-50 border-r-2 border-primary'
                          )}
                          onClick={() => handleChatSelect(chat)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherParticipant.avatar} />
                            <AvatarFallback className="bg-primary text-white">
                              {getInitials(`${otherParticipant.firstName} ${otherParticipant.lastName}`)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-neutral-dark truncate">
                                {`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                              </h3>
                              {chat.lastMessage && (
                                <span className="text-xs text-neutral-gray">
                                  {formatTimeAgo(new Date(chat.lastMessage.createdAt))}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-neutral-gray truncate">
                                {chat.lastMessage?.content || 'No messages yet'}
                              </p>
                              {chat.unreadCount > 0 && (
                                <div className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {chat.unreadCount}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-neutral-gray">No conversations found</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border-gray bg-neutral-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const otherParticipant = selectedChat.participants.find(p => p.id !== user?.id);
                          return otherParticipant ? (
                            <>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={otherParticipant.avatar} />
                                <AvatarFallback className="bg-primary text-white">
                                  {getInitials(`${otherParticipant.firstName} ${otherParticipant.lastName}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-neutral-dark">
                                  {`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                                </h3>
                                <p className="text-sm text-neutral-gray">
                                  {otherParticipant.isVerified ? 'Verified trader' : 'Trader'}
                                </p>
                              </div>
                            </>
                          ) : null;
                        })()}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loading size="md" />
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => {
                          const isOwnMessage = message.senderId === user?.id;
                          
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                'flex',
                                isOwnMessage ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <div
                                className={cn(
                                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                                  isOwnMessage
                                    ? 'chat-bubble-sent'
                                    : 'chat-bubble-received'
                                )}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div className={cn(
                                  'flex items-center gap-1 mt-1',
                                  isOwnMessage ? 'justify-end' : 'justify-start'
                                )}>
                                  <span className="text-xs opacity-70">
                                    {new Date(message.createdAt).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {isOwnMessage && getMessageStatusIcon(message.status)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border-gray bg-neutral-50">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" type="button">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        disabled={sending}
                      />
                      
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!newMessage.trim() || sending}
                        loading={sending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto">
                        <Send className="h-8 w-8 text-neutral-gray" />
                      </div>
                    </div>
                    <h3 className="heading-2 mb-2">Select a conversation</h3>
                    <p className="subtext">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ChatPage = withAuth(ChatPageComponent);
export default ChatPage;