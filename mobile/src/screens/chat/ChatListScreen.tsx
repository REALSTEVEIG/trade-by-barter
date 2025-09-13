import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '@/lib/api';
import socketService from '@/lib/socket';
import { AppStackParamList } from '@/navigation';
import { Chat } from '@/types';
import { COLORS, TYPOGRAPHY, ERROR_MESSAGES } from '@/constants';
import Avatar from '@/components/ui/Avatar';
import Loading from '@/components/ui/Loading';

type ChatListScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchChats();
    initializeSocket();
    
    return () => {
      // Clean up socket listeners when component unmounts
      socketService.disconnect();
    };
  }, []);

  // Connect socket when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!isConnected) {
        initializeSocket();
      }
      return () => {
        // Keep socket connected but remove specific listeners
      };
    }, [isConnected])
  );

  const initializeSocket = async () => {
    try {
      const connected = await socketService.connect();
      setIsConnected(connected);
      
      if (connected) {
        // Listen for new messages to update chat list
        const unsubscribeMessage = socketService.onMessage((message) => {
          updateChatWithNewMessage(message);
        });

        // Listen for connection status
        const unsubscribeConnection = socketService.onConnection((connected) => {
          setIsConnected(connected);
        });

        // Store unsubscribe functions for cleanup
        return () => {
          unsubscribeMessage();
          unsubscribeConnection();
        };
      }
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setIsConnected(false);
    }
  };

  const updateChatWithNewMessage = (message: any) => {
    setChats(prevChats => {
      const updatedChats = [...prevChats];
      const chatIndex = updatedChats.findIndex(chat => chat.id === message.chatId);
      
      if (chatIndex !== -1) {
        // Update existing chat
        const updatedChat = {
          ...updatedChats[chatIndex],
          lastMessage: message,
          updatedAt: message.createdAt,
        };
        updatedChats[chatIndex] = updatedChat;
        
        // Move to top
        updatedChats.unshift(updatedChats.splice(chatIndex, 1)[0]);
      } else {
        // If chat doesn't exist, refetch chats
        fetchChats();
      }
      
      return updatedChats;
    });
  };

  const fetchChats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await chatApi.getChats();
      setChats(response.data as Chat[]);
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      if (!isRefresh) {
        Alert.alert(
          'Error',
          error.response?.data?.message || ERROR_MESSAGES.NETWORK
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchChats(true);
  };

  const handleChatPress = (chat: Chat) => {
    navigation.navigate('Chat', { 
      chatId: chat.id,
      otherUserId: chat.participants.find(p => p.id !== chat.participants[0].id)?.id,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherParticipant = item.participants.find(p => p.id !== item.participants[0].id);
    const lastMessage = (item as any).lastMessage;
    const unreadCount = (item as any).unreadCount || 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <Avatar
          source={otherParticipant?.avatar ? { uri: otherParticipant.avatar } : undefined}
          name={otherParticipant?.firstName ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'User'}
          size="lg"
          showBadge={unreadCount > 0}
          badgeColor={COLORS.secondary.DEFAULT}
        />

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.participantName} numberOfLines={1}>
              {otherParticipant?.firstName ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown User'}
            </Text>
            {lastMessage && (
              <Text style={styles.timestamp}>
                {formatTime(lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <View style={styles.messageRow}>
            <Text 
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.unreadMessage,
              ]} 
              numberOfLines={1}
            >
              {lastMessage?.content || 'No messages yet'}
            </Text>
            
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color={COLORS.neutral.gray} />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Start trading to begin conversations with other users
      </Text>
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <Ionicons name="cloud-offline-outline" size={16} color={COLORS.status.warning} />
          <Text style={styles.connectionText}>Offline - Pull to refresh</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Messages</Text>
          <View style={styles.connectionIndicator}>
            <View style={[
              styles.connectionDot,
              { backgroundColor: isConnected ? COLORS.status.success : COLORS.status.warning }
            ]} />
            <Text style={styles.connectionText}>
              {isConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary.DEFAULT]}
            tintColor={COLORS.primary.DEFAULT}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.status.warning + '20',
    borderRadius: 8,
  },
  listContent: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    flex: 1,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    flex: 1,
  },
  unreadMessage: {
    color: COLORS.neutral.dark,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: COLORS.secondary.DEFAULT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'white',
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontWeight: '600',
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
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ChatListScreen;