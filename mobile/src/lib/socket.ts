import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/constants/network';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SocketAuth {
  token: string;
  userId: string;
}

interface ChatMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'offer';
  senderId: string;
  chatId: string;
  createdAt: string;
  metadata?: any;
}

interface TypingStatus {
  userId: string;
  chatId: string;
  isTyping: boolean;
}

interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private auth: SocketAuth | null = null;

  // Event listeners
  private messageListeners: ((message: ChatMessage) => void)[] = [];
  private typingListeners: ((status: TypingStatus) => void)[] = [];
  private presenceListeners: ((presence: UserPresence) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.auth = { token, userId: user.id };
        console.log('Socket auth initialized successfully');
      } else {
        console.warn('No token or user data found for socket authentication');
        this.auth = null;
      }
    } catch (error) {
      console.error('Failed to initialize socket auth:', error);
      this.auth = null;
    }
  }

  async connect(): Promise<boolean> {
    if (this.isConnected) {
      console.log('Socket already connected');
      return true;
    }

    try {
      // Always refresh auth before connecting
      await this.initializeAuth();

      if (!this.auth?.token) {
        console.warn('No authentication available for socket connection');
        // Return false but don't block other functionality
        return false;
      }

      console.log('Connecting socket with authentication...');

      // Create socket connection with auth
      this.socket = io(API_CONFIG.WS_URL, {
        auth: {
          token: this.auth.token,
        },
        transports: ['websocket'],
        timeout: 10000,
        autoConnect: false,
      });

      // Set up event listeners
      this.setupEventListeners();

      // Connect
      this.socket.connect();

      return new Promise((resolve) => {
        if (!this.socket) {
          resolve(false);
          return;
        }

        this.socket.on('connect', () => {
          console.log('Socket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionListeners(true);
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.isConnected = false;
          this.notifyConnectionListeners(false);
          resolve(false);
        });

        // Timeout fallback
        setTimeout(() => {
          if (!this.isConnected) {
            console.error('Socket connection timeout');
            resolve(false);
          }
        }, 10000);
      });
    } catch (error) {
      console.error('Failed to connect socket:', error);
      return false;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.notifyConnectionListeners(false);

      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.attemptReconnect();
      }
    });

    // Chat events
    this.socket.on('message:new', (message: ChatMessage) => {
      console.log('New message received:', message);
      this.notifyMessageListeners(message);
    });

    this.socket.on('message:updated', (message: ChatMessage) => {
      console.log('Message updated:', message);
      this.notifyMessageListeners(message);
    });

    // Typing events
    this.socket.on('user:typing', (status: TypingStatus) => {
      this.notifyTypingListeners(status);
    });

    // Presence events
    this.socket.on('user:online', (presence: UserPresence) => {
      this.notifyPresenceListeners({ ...presence, isOnline: true });
    });

    this.socket.on('user:offline', (presence: UserPresence) => {
      this.notifyPresenceListeners({ ...presence, isOnline: false });
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('auth:error', (error) => {
      console.error('Socket auth error:', error);
      this.disconnect();
    });
  }

  private async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(async () => {
      await this.connect();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionListeners(false);
    console.log('Socket disconnected');
  }

  // Join/Leave chat rooms
  joinChat(chatId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:join', { chatId });
      console.log(`Joined chat: ${chatId}`);
    }
  }

  leaveChat(chatId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:leave', { chatId });
      console.log(`Left chat: ${chatId}`);
    }
  }

  // Send messages
  sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'offer' = 'text', metadata?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message:send', {
        chatId,
        content,
        type,
        metadata,
      });
    } else {
      console.warn('Cannot send message: Socket not connected');
    }
  }

  // Typing indicators
  setTyping(chatId: string, isTyping: boolean) {
    if (this.socket && this.isConnected && this.auth) {
      this.socket.emit('user:typing', {
        chatId,
        userId: this.auth.userId,
        isTyping,
      });
    }
  }

  // Mark messages as read
  markAsRead(chatId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:read', { chatId });
    }
  }

  // Event listener management
  onMessage(callback: (message: ChatMessage) => void) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  onTyping(callback: (status: TypingStatus) => void) {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter(cb => cb !== callback);
    };
  }

  onPresence(callback: (presence: UserPresence) => void) {
    this.presenceListeners.push(callback);
    return () => {
      this.presenceListeners = this.presenceListeners.filter(cb => cb !== callback);
    };
  }

  onConnection(callback: (connected: boolean) => void) {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  // Notification methods
  private notifyMessageListeners(message: ChatMessage) {
    this.messageListeners.forEach(callback => callback(message));
  }

  private notifyTypingListeners(status: TypingStatus) {
    this.typingListeners.forEach(callback => callback(status));
  }

  private notifyPresenceListeners(presence: UserPresence) {
    this.presenceListeners.forEach(callback => callback(presence));
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(callback => callback(connected));
  }

  // Utility methods
  getConnectionStatus() {
    return this.isConnected;
  }

  async updateAuth() {
    console.log('Updating socket authentication...');
    await this.initializeAuth();
    if (this.auth?.token) {
      if (this.isConnected) {
        // Reconnect with new auth
        this.disconnect();
        await this.connect();
      }
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;