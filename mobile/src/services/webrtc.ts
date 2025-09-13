
interface CallUser {
  id: string;
  name: string;
  avatar?: string;
}

interface CallState {
  isInCall: boolean;
  isInitiator: boolean;
  remoteUser: CallUser | null;
  localStream: any | null;
  remoteStream: any | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  callType: 'video' | 'audio';
  callStatus: 'connecting' | 'ringing' | 'connected' | 'ended' | 'failed';
}

type CallEventCallback = (data: any) => void;

class MobileWebRTCService {
  private state: CallState = {
    isInCall: false,
    isInitiator: false,
    remoteUser: null,
    localStream: null,
    remoteStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    callType: 'video',
    callStatus: 'ended'
  };
  
  private eventCallbacks: Map<string, CallEventCallback[]> = new Map();

  constructor() {
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // Set up socket event listeners for WebRTC signaling
    // Note: In a real implementation, these would be proper socket events
    // For now, we'll use a simplified approach
  }

  async initialize(): Promise<void> {
    // Initialize with socket service if needed
    return Promise.resolve();
  }

  async initiateCall(_userId: string, callType: 'video' | 'audio', remoteUser: CallUser): Promise<void> {
    try {
      this.state.callType = callType;
      this.state.isInitiator = true;
      this.state.remoteUser = remoteUser;
      this.state.callStatus = 'connecting';
      
      // For demo purposes, simulate getting user media
      await this.simulateGetUserMedia();
      
      // Send offer through socket (would use proper socket methods in real implementation)
      // For now, we simulate the call initiation
      
      this.state.callStatus = 'ringing';
      this.state.isInCall = true;
      this.emitEvent('callStateChanged', this.state);
      
    } catch (error) {
      console.error('Failed to initiate call:', error);
      this.state.callStatus = 'failed';
      this.emitEvent('callStateChanged', this.state);
      throw error;
    }
  }

  async acceptCall(): Promise<void> {
    try {
      this.state.isInitiator = false;
      this.state.callStatus = 'connecting';
      
      await this.simulateGetUserMedia();
      
      // Send answer through socket (would use proper socket methods in real implementation)
      // For now, we simulate the call acceptance
      
      this.state.callStatus = 'connected';
      this.state.isInCall = true;
      this.emitEvent('callStateChanged', this.state);
      
    } catch (error) {
      console.error('Failed to accept call:', error);
      this.rejectCall();
      throw error;
    }
  }

  rejectCall(): void {
    if (this.state.remoteUser) {
      // Send rejection through socket (would use proper socket methods in real implementation)
      // For now, we simulate the call rejection
    }
    this.cleanup();
  }

  endCall(): void {
    if (this.state.remoteUser && this.state.isInCall) {
      // Send call end through socket (would use proper socket methods in real implementation)
      // For now, we simulate the call ending
    }
    this.cleanup();
  }

  toggleVideo(): void {
    this.state.isVideoEnabled = !this.state.isVideoEnabled;
    this.emitEvent('callStateChanged', this.state);
  }

  toggleAudio(): void {
    this.state.isAudioEnabled = !this.state.isAudioEnabled;
    this.emitEvent('callStateChanged', this.state);
  }

  private async simulateGetUserMedia(): Promise<void> {
    // In a real implementation, this would use react-native-webrtc
    // For now, we'll simulate the media stream
    this.state.localStream = { id: 'local-stream' };
    this.emitEvent('localStreamReady', this.state.localStream);
  }


  private cleanup(): void {
    // Reset state
    this.state = {
      isInCall: false,
      isInitiator: false,
      remoteUser: null,
      localStream: null,
      remoteStream: null,
      isVideoEnabled: true,
      isAudioEnabled: true,
      callType: 'video',
      callStatus: 'ended'
    };

    this.emitEvent('callEnded', {});
    this.emitEvent('callStateChanged', this.state);
  }

  // Event management
  on(event: string, callback: CallEventCallback): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  off(event: string, callback?: CallEventCallback): void {
    if (!this.eventCallbacks.has(event)) return;
    
    if (callback) {
      const callbacks = this.eventCallbacks.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.eventCallbacks.delete(event);
    }
  }

  private emitEvent(event: string, data: any): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Getters
  getState(): CallState {
    return { ...this.state };
  }

  isInCall(): boolean {
    return this.state.isInCall;
  }
}

export const webrtcService = new MobileWebRTCService();
export type { CallState, CallUser };