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
import { chatApi } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { webrtcService, CallState, CallUser } from '@/lib/webrtc';
import { CallInterface, IncomingCall } from '@/components/common/call-interface';
import { ProfileModal } from '@/components/common/profile-modal';

// Real-time state
interface TypingUser {
  userId: string;
  name: string;
}

interface OnlineUsers {
  [userId: string]: boolean;
}

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
  const [typingUsers, setTypingUsers] = React.useState<TypingUser[]>([]);
  const [_onlineUsers, setOnlineUsers] = React.useState<OnlineUsers>({});
  const [isTyping, setIsTyping] = React.useState(false);
  const [socketConnected, setSocketConnected] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Call state
  const [_callState, setCallState] = React.useState<CallState>(webrtcService.getState());
  const [showCallInterface, setShowCallInterface] = React.useState(false);
  const [incomingCall, setIncomingCall] = React.useState<{
    caller: CallUser;
    callType: 'video' | 'audio';
  } | null>(null);
  const [showProfileModal, setShowProfileModal] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const typingTimeoutRef = React.useRef<number | null>(null);

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
      setError(null);
      const response = await chatApi.getChats();
      // Transform the response to match our Chat interface
      const responseData = response.data as any;
      const transformedChats = (responseData?.items || responseData || []).map((chat: any) => ({
        id: chat.id,
        participants: chat.participants || [],
        lastMessage: chat.lastMessage ? {
          id: chat.lastMessage.id,
          chatId: chat.id,
          senderId: chat.lastMessage.senderId,
          content: chat.lastMessage.content,
          type: chat.lastMessage.messageType || chat.lastMessage.type,
          status: 'read', // Default status
          createdAt: new Date(chat.lastMessage.createdAt),
          updatedAt: new Date(chat.lastMessage.createdAt),
        } : undefined,
        unreadCount: chat.unreadCount || 0,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt || chat.createdAt),
      }));
      setChats(transformedChats);
    } catch (err: any) {
      console.error('Failed to fetch chats:', err);
      setError(err.response?.data?.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = React.useCallback(async (chatId: string): Promise<void> => {
    try {
      setMessagesLoading(true);
      setError(null);
      const response = await chatApi.getMessages(chatId);
      // Transform the response to match our Message interface
      const responseData = response.data as any;
      const transformedMessages = (responseData?.items || responseData || []).map((msg: any) => ({
        id: msg.id,
        chatId: msg.chatId,
        senderId: msg.senderId,
        content: msg.content,
        type: msg.type || msg.messageType,
        status: msg.isRead ? 'read' : 'delivered',
        createdAt: new Date(msg.createdAt || msg.sentAt),
        updatedAt: new Date(msg.updatedAt || msg.createdAt || msg.sentAt),
        mediaUrl: msg.mediaUrl,
        metadata: msg.metadata,
      })).reverse(); // Reverse to show oldest first
      setMessages(transformedMessages);
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Socket.IO connection effect
  React.useEffect(() => {
    const connectSocket = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      try {
        await socketService.connect(token);
        await webrtcService.initialize(socketService);
        setSocketConnected(true);
        setError(null);

        // Set up Socket.IO event listeners
        socketService.onMessageReceived((message) => {
          setMessages(prev => [...prev, {
            id: message.id,
            chatId: message.chatId,
            senderId: message.senderId,
            content: message.content,
            type: message.type,
            status: 'delivered',
            createdAt: new Date(message.sentAt || message.createdAt),
            updatedAt: new Date(message.updatedAt || message.createdAt),
            mediaUrl: message.mediaUrl,
            metadata: message.metadata,
          }]);

          // Update chat list with new message
          setChats(prev => prev.map(chat =>
            chat.id === message.chatId
              ? {
                  ...chat,
                  lastMessage: {
                    id: message.id,
                    chatId: message.chatId,
                    senderId: message.senderId,
                    content: message.content,
                    type: message.type,
                    status: 'delivered',
                    createdAt: new Date(message.sentAt || message.createdAt),
                    updatedAt: new Date(message.updatedAt || message.createdAt),
                  },
                  unreadCount: message.senderId !== user?.id ? chat.unreadCount + 1 : chat.unreadCount,
                }
              : chat
          ));
        });

        socketService.onMessageSent((data) => {
          // Update message status to sent
          setMessages(prev => prev.map(msg =>
            msg.id === data.messageId
              ? { ...msg, status: 'sent' }
              : msg
          ));
        });

        socketService.onUserTyping((data) => {
          if (data.userId !== user?.id && selectedChat?.id === data.chatId) {
            setTypingUsers(prev => {
              const exists = prev.find(u => u.userId === data.userId);
              if (!exists) {
                return [...prev, { userId: data.userId, name: 'User' }]; // Would get name from participants
              }
              return prev;
            });
          }
        });

        socketService.onUserStoppedTyping((data) => {
          if (data.userId !== user?.id) {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
          }
        });

        socketService.onUserPresenceChanged((data) => {
          setOnlineUsers(prev => ({
            ...prev,
            [data.userId]: data.isOnline,
          }));
        });

        socketService.onError((error) => {
          console.error('Socket error:', error);
          setError(error.message);
        });

      } catch (err: any) {
        console.error('Failed to connect to chat:', err);
        setError('Failed to connect to chat server');
        setSocketConnected(false);
      }
    };

    connectSocket();

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
      webrtcService.cleanup();
      setSocketConnected(false);
    };
  }, [user?.id, selectedChat?.id]);

  // WebRTC event listeners
  React.useEffect(() => {
    const handleCallStateChange = (newState: CallState) => {
      setCallState(newState);
      setShowCallInterface(newState.isInCall);
    };

    const handleIncomingCall = (data: { caller: CallUser; callType: 'video' | 'audio' }) => {
      setIncomingCall(data);
    };

    const handleCallEnded = () => {
      setShowCallInterface(false);
      setIncomingCall(null);
    };

    webrtcService.on('callStateChanged', handleCallStateChange);
    webrtcService.on('incomingCall', handleIncomingCall);
    webrtcService.on('callEnded', handleCallEnded);

    return () => {
      webrtcService.off('callStateChanged', handleCallStateChange);
      webrtcService.off('incomingCall', handleIncomingCall);
      webrtcService.off('callEnded', handleCallEnded);
    };
  }, []);

  React.useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  React.useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      
      // Join chat room
      if (socketConnected) {
        socketService.joinChat(selectedChat.id);
        socketService.markAsRead(selectedChat.id);
      }
    }

    return () => {
      if (selectedChat && socketConnected) {
        socketService.leaveChat(selectedChat.id);
      }
    };
  }, [selectedChat, socketConnected, fetchMessages]);

  const handleChatSelect = (chat: Chat): void => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setIsTyping(false);
      if (socketConnected) {
        socketService.stopTyping(selectedChat.id);
      }

      const messageContent = newMessage.trim();
      setNewMessage('');

      // Add optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        chatId: selectedChat.id,
        senderId: user!.id,
        content: messageContent,
        type: 'text',
        status: 'sending' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMessages(prev => [...prev, optimisticMessage]);

      if (socketConnected) {
        // Send via Socket.IO for real-time delivery
        socketService.sendMessage({
          chatId: selectedChat.id,
          type: 'TEXT',
          content: messageContent,
        });
      } else {
        // Fallback to HTTP API
        await chatApi.sendMessage({
          chatId: selectedChat.id,
          type: 'TEXT',
          content: messageContent,
        });
      }

      // Remove optimistic message since real message will come via socket
      setMessages(prev => prev.filter(msg => msg.id !== tempId));

    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value: string): void => {
    setNewMessage(value);

    if (!selectedChat || !socketConnected) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing if not already
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      socketService.startTyping(selectedChat.id);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(selectedChat.id);
      typingTimeoutRef.current = null;
    }, 3000);

    // Stop typing immediately if message is empty
    if (!value.trim() && isTyping) {
      setIsTyping(false);
      socketService.stopTyping(selectedChat.id);
    }
  };

  const handleInitiateCall = async (callType: 'video' | 'audio') => {
    if (!selectedChat || !socketConnected) return;
    
    const otherParticipant = selectedChat.participants.find(p => p.id !== user?.id);
    if (!otherParticipant) return;

    try {
      await webrtcService.initiateCall(otherParticipant.id, callType, {
        id: otherParticipant.id,
        name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
        ...(otherParticipant.avatar && { avatar: otherParticipant.avatar }),
      });
    } catch (err: any) {
      console.error('Failed to initiate call:', err);
      setError('Failed to start call');
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    
    try {
      await webrtcService.acceptCall();
      setIncomingCall(null);
    } catch (err: any) {
      console.error('Failed to accept call:', err);
      setError('Failed to accept call');
    }
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    
    webrtcService.rejectCall();
    setIncomingCall(null);
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
                            <button
                              onClick={() => setShowProfileModal(true)}
                              className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={otherParticipant.avatar} />
                                <AvatarFallback className="bg-primary text-white">
                                  {getInitials(`${otherParticipant.firstName} ${otherParticipant.lastName}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <h3 className="font-medium text-neutral-dark">
                                  {`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                                </h3>
                                <p className="text-sm text-neutral-gray">
                                  {otherParticipant.isVerified ? 'Verified trader' : 'Trader'}
                                </p>
                              </div>
                            </button>
                          ) : null;
                        })()}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInitiateCall('audio')}
                          disabled={!socketConnected}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInitiateCall('video')}
                          disabled={!socketConnected}
                        >
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
                    ) : error ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <p className="text-red-600 mb-2">{error}</p>
                          <Button variant="outline" size="sm" onClick={() => selectedChat && fetchMessages(selectedChat.id)}>
                            Try Again
                          </Button>
                        </div>
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
                        
                        {/* Typing Indicator */}
                        {typingUsers.length > 0 && (
                          <div className="flex justify-start">
                            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-neutral-100">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-neutral-600">
                                  {typingUsers.length === 1 ? `${typingUsers[0]?.name || 'Someone'} is typing...` : 'Multiple people are typing...'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
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
                        onChange={(e) => handleTyping(e.target.value)}
                        className="flex-1"
                        disabled={sending || !socketConnected}
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

      {/* Call Interface */}
      <CallInterface
        isVisible={showCallInterface}
        onClose={() => setShowCallInterface(false)}
      />

      {/* Incoming Call */}
      {incomingCall && (
        <IncomingCall
          caller={incomingCall.caller}
          callType={incomingCall.callType}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Profile Modal */}
      {selectedChat && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={selectedChat.participants.find(p => p.id !== user?.id)?.id || ''}
          onStartCall={handleInitiateCall}
          onSendMessage={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}

const ChatPage = withAuth(ChatPageComponent);
export default ChatPage;