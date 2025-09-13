import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.isConnected) {
        resolve();
        return;
      }

      const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

      this.socket = io(`${socketUrl}/chat`, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to chat server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from chat server:', reason);
        this.isConnected = false;
        
        // Auto-reconnect on unexpected disconnections
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          return;
        }
        
        this.handleReconnect(token);
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      this.socket.on('connected', (data) => {
        console.log('Welcome message:', data.message);
      });

      // Set up event listeners for Nigerian context
      this.socket.on('network_status', (data) => {
        console.log('Network status:', data.status, data.message);
        // You can show network status to users
      });

      this.socket.on('holiday_greeting', (data) => {
        console.log('Holiday greeting:', data.message);
        // Show Nigerian holiday greetings
      });
    });
  }

  private handleReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
      this.connect(token).catch(() => {
        this.handleReconnect(token);
      });
    }, delay);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Chat events
  joinChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  sendMessage(messageData: {
    chatId: string;
    type: string;
    content: string;
    mediaUrl?: string;
    metadata?: any;
  }): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', messageData);
    }
  }

  startTyping(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { chatId });
    }
  }

  stopTyping(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { chatId });
    }
  }

  markAsRead(chatId: string, messageId?: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_read', { chatId, messageId });
    }
  }

  getOnlineUsers(chatId?: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_online_users', { chatId });
    }
  }

  ping(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Event listeners
  onMessageReceived(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on('message_received', callback);
    }
  }

  onMessageSent(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('message_sent', callback);
    }
  }

  onChatJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('chat_joined', callback);
    }
  }

  onChatLeft(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('chat_left', callback);
    }
  }

  onUserTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStoppedTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
    }
  }

  onMessageRead(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('message_read', callback);
    }
  }

  onMessagesMarkedRead(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('messages_marked_read', callback);
    }
  }

  onUserPresenceChanged(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user_presence_changed', callback);
    }
  }

  onOnlineUsers(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('online_users', callback);
    }
  }

  onChatUpdated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('chat_updated', callback);
    }
  }

  onNewChatCreated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('new_chat_created', callback);
    }
  }

  onTradeUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('trade_update', callback);
    }
  }

  onOfferUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('offer_update', callback);
    }
  }

  onPong(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('pong', callback);
    }
  }

  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Getters
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

// Create singleton instance
export const socketService = new SocketService();

// Socket context for React
export default socketService;