import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '@/lib/api';
import socketService from '@/lib/socket';
import { AppStackParamList } from '@/navigation';
import { Message, User } from '@/types';
import { COLORS, TYPOGRAPHY, formatTimeAgo } from '@/constants';
import Avatar from '@/components/ui/Avatar';
import Loading from '@/components/ui/Loading';
import { webrtcService, CallState, CallUser } from '@/services/webrtc';
import { CallInterface, IncomingCall } from '@/components/CallInterface';
import { ProfileModal } from '@/components/ProfileModal';

type ChatRouteProp = RouteProp<AppStackParamList, 'Chat'>;

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  previousMessage?: Message;
  nextMessage?: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  showAvatar,
  previousMessage,
  nextMessage,
}) => {
  const isFirstInGroup = !previousMessage || previousMessage.senderId !== message.senderId;
  const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;
  const showTime = isLastInGroup || (nextMessage && 
    new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > 60000); // 1 minute

  return (
    <View style={[
      styles.messageContainer,
      isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
    ]}>
      {!isOwn && showAvatar && isFirstInGroup && (
        <Avatar
          source={message.sender?.avatar ? { uri: message.sender.avatar } : undefined}
          name={`${message.sender?.firstName} ${message.sender?.lastName}`}
          size="sm"
          style={styles.messageAvatar}
        />
      )}
      
      <View style={[
        styles.messageBubble,
        isOwn ? styles.ownMessageBubble : styles.otherMessageBubble,
        isFirstInGroup && styles.messageGroupFirst,
        isLastInGroup && styles.messageGroupLast,
        !isOwn && !showAvatar && styles.messageWithoutAvatar,
      ]}>
        <Text style={[
          styles.messageText,
          isOwn ? styles.ownMessageText : styles.otherMessageText,
        ]}>
          {message.content}
        </Text>
        
        {showTime && (
          <Text style={[
            styles.messageTime,
            isOwn ? styles.ownMessageTime : styles.otherMessageTime,
          ]}>
            {formatTimeAgo(message.createdAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

const TypingIndicator: React.FC<{ visible: boolean }> = ({ visible }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.typingContainer, { opacity }]}>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>Someone is typing...</Text>
        <View style={styles.typingDots}>
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
        </View>
      </View>
    </Animated.View>
  );
};

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation();
  const { chatId, otherUserId } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  
  // Call state
  const [, setCallState] = useState<CallState>(webrtcService.getState());
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    caller: CallUser;
    callType: 'video' | 'audio';
  } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMessages();
    initializeSocket();
    initializeWebRTC();
    
    return () => {
      socketService.leaveChat(chatId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);

  const initializeWebRTC = () => {
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
  };

  useFocusEffect(
    useCallback(() => {
      if (isConnected) {
        socketService.joinChat(chatId);
        socketService.markAsRead(chatId);
      }
      
      return () => {
        if (isConnected) {
          socketService.setTyping(chatId, false);
        }
      };
    }, [chatId, isConnected])
  );

  const initializeSocket = async () => {
    try {
      const connected = await socketService.connect();
      setIsConnected(connected);
      
      if (connected) {
        socketService.joinChat(chatId);
        
        // Listen for new messages
        const unsubscribeMessage = socketService.onMessage((socketMessage) => {
          if (socketMessage.chatId === chatId) {
            // Convert socket message to Message type
            const message: Message = {
              id: socketMessage.id,
              chatId: socketMessage.chatId,
              senderId: socketMessage.senderId,
              sender: {} as User, // Will be populated from API or existing data
              content: socketMessage.content,
              type: socketMessage.type as 'text' | 'image' | 'voice' | 'system',
              isRead: false,
              createdAt: socketMessage.createdAt,
              metadata: socketMessage.metadata,
            };
            
            setMessages(prev => [message, ...prev]);
            socketService.markAsRead(chatId);
            scrollToBottom();
          }
        });

        // Listen for typing indicators
        const unsubscribeTyping = socketService.onTyping((status) => {
          if (status.chatId === chatId && status.userId !== otherUserId) {
            setOtherUserTyping(status.isTyping);
          }
        });

        // Listen for connection status
        const unsubscribeConnection = socketService.onConnection((connected) => {
          setIsConnected(connected);
        });

        return () => {
          unsubscribeMessage();
          unsubscribeTyping();
          unsubscribeConnection();
        };
      }
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setIsConnected(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await chatApi.getMessages(chatId);
      const messagesData = response.data as Message[];
      setMessages(messagesData.reverse()); // Reverse to show latest at bottom
      
      // Get other user info from first message
      if (messagesData.length > 0) {
        const otherMessage = messagesData.find(m => m.senderId === otherUserId);
        if (otherMessage) {
          setOtherUser(otherMessage.sender);
        }
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({ index: 0, animated: true });
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending || !isConnected) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId,
      senderId: 'current-user',
      sender: {} as User,
      content: messageText.trim(),
      type: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistically add message to UI
    setMessages(prev => [tempMessage, ...prev]);
    setMessageText('');
    setIsSending(true);

    try {
      // Send via Socket.IO for real-time delivery
      socketService.sendMessage(chatId, messageText.trim());
      
      // Also send via API for persistence
      await chatApi.sendMessage({
        chatId,
        content: messageText.trim(),
        type: 'text',
      });

      // Remove temporary message as real one will come via socket
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      
    } catch (error: any) {
      // Remove temp message and show error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      Alert.alert('Error', 'Failed to send message');
      setMessageText(tempMessage.content);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);
    
    if (!isConnected) return;

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      socketService.setTyping(chatId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.setTyping(chatId, false);
    }, 1000);
  };

  const handleInitiateCall = async (callType: 'video' | 'audio') => {
    if (!otherUser || !isConnected) {
      Alert.alert('Error', 'Cannot start call. Please check your connection.');
      return;
    }
    
    try {
      await webrtcService.initiateCall(otherUser.id, callType, {
        id: otherUser.id,
        name: `${otherUser.firstName} ${otherUser.lastName}`,
        ...(otherUser.avatar && { avatar: otherUser.avatar }),
      });
    } catch (err: any) {
      console.error('Failed to initiate call:', err);
      Alert.alert('Error', 'Failed to start call');
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    
    try {
      await webrtcService.acceptCall();
      setIncomingCall(null);
    } catch (err: any) {
      console.error('Failed to accept call:', err);
      Alert.alert('Error', 'Failed to accept call');
    }
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    
    webrtcService.rejectCall();
    setIncomingCall(null);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId !== otherUserId;
    const previousMessage = messages[index + 1];
    const nextMessage = messages[index - 1];
    const showAvatar = !isOwn && (!nextMessage || nextMessage.senderId !== item.senderId);

    return (
      <ChatBubble
        message={item}
        isOwn={isOwn}
        showAvatar={showAvatar}
        previousMessage={previousMessage}
        nextMessage={nextMessage}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={64} color={COLORS.neutral.gray} />
      <Text style={styles.emptyTitle}>Start the conversation</Text>
      <Text style={styles.emptySubtitle}>Send a message to begin trading</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.neutral.dark} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => setShowProfileModal(true)}
        >
          <Avatar
            source={otherUser?.avatar ? { uri: otherUser.avatar } : undefined}
            name={otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'User'}
            size="sm"
          />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>
              {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'User'}
            </Text>
            <Text style={[
              styles.headerStatus,
              { color: isConnected ? COLORS.status.success : COLORS.status.warning }
            ]}>
              {isConnected ? (otherUserTyping ? 'Typing...' : 'Online') : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Call buttons */}
        <View style={styles.callButtons}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleInitiateCall('audio')}
            disabled={!isConnected}
          >
            <Ionicons name="call" size={20} color={isConnected ? COLORS.primary.DEFAULT : COLORS.neutral.gray} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleInitiateCall('video')}
            disabled={!isConnected}
          >
            <Ionicons name="videocam" size={20} color={isConnected ? COLORS.primary.DEFAULT : COLORS.neutral.gray} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={renderEmpty}
          inverted
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />
        
        <TypingIndicator visible={otherUserTyping} />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.neutral.gray}
              value={messageText}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
              editable={isConnected}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!messageText.trim() || isSending || !isConnected) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSending || !isConnected}
            >
              <Ionicons
                name={isSending ? "hourglass" : "send"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

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
      {otherUserId && (
        <ProfileModal
          isVisible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={otherUserId}
          onStartCall={handleInitiateCall}
          onSendMessage={() => setShowProfileModal(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  callButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    padding: 8,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  headerStatus: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 1,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary.DEFAULT,
    marginLeft: '25%',
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    marginRight: '25%',
  },
  messageWithoutAvatar: {
    marginLeft: 40,
  },
  messageGroupFirst: {
    marginTop: 8,
  },
  messageGroupLast: {
    marginBottom: 8,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: COLORS.neutral.dark,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: 4,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: COLORS.neutral.gray,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    maxWidth: '75%',
  },
  typingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.neutral.gray,
    marginHorizontal: 1,
  },
  typingDot1: {},
  typingDot2: {},
  typingDot3: {},
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: COLORS.primary.DEFAULT,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.neutral.gray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
  },
});

export default ChatScreen;