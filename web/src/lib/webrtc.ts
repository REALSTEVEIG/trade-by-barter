import { socketService } from './socket';

interface CallUser {
  id: string;
  name: string;
  avatar?: string;
}

interface CallState {
  isInCall: boolean;
  isInitiator: boolean;
  remoteUser: CallUser | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  callType: 'video' | 'audio';
  callStatus: 'connecting' | 'ringing' | 'connected' | 'ended' | 'failed';
}

type CallEventCallback = (data: any) => void;

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
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
  
  private pcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.setupSocketListeners();
      this.extendSocketService();
    }
  }

  private extendSocketService() {
    // Only extend in browser environment
    if (typeof window === 'undefined') return;
    
    // Add call-related methods to socket service
    (socketService as any).sendCallOffer = (data: any) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.emit('call_offer', data);
      }
    };

    (socketService as any).sendCallAnswer = (data: any) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.emit('call_answer', data);
      }
    };

    (socketService as any).sendIceCandidate = (data: any) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.emit('ice_candidate', data);
      }
    };

    (socketService as any).sendCallEnd = (data: any) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.emit('call_end', data);
      }
    };

    (socketService as any).sendCallRejection = (data: any) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.emit('call_rejected', data);
      }
    };

    (socketService as any).onCallOffer = (callback: (data: any) => void) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.on('call_offer', callback);
      }
    };

    (socketService as any).onCallAnswer = (callback: (data: any) => void) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.on('call_answer', callback);
      }
    };

    (socketService as any).onIceCandidate = (callback: (data: any) => void) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.on('ice_candidate', callback);
      }
    };

    (socketService as any).onCallEnd = (callback: () => void) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.on('call_end', callback);
      }
    };

    (socketService as any).onCallRejected = (callback: () => void) => {
      if ((socketService as any).socket) {
        (socketService as any).socket.on('call_rejected', callback);
      }
    };
  }

  private setupSocketListeners() {
    // Only set up listeners in browser environment
    if (typeof window === 'undefined') return;
    
    // Ensure socket service methods exist before using them
    if (!(socketService as any).onCallOffer) return;
    
    (socketService as any).onCallOffer((data: any) => {
      this.handleCallOffer(data);
    });

    (socketService as any).onCallAnswer((data: any) => {
      this.handleCallAnswer(data);
    });

    (socketService as any).onIceCandidate((data: any) => {
      this.handleIceCandidate(data);
    });

    (socketService as any).onCallEnd(() => {
      this.endCall();
    });

    (socketService as any).onCallRejected(() => {
      this.handleCallRejected();
    });
  }

  // Public API
  async initialize(_socketService: any): Promise<void> {
    // This method is for initializing with the socket service if needed
    // Currently, we extend the socket service in constructor
    return Promise.resolve();
  }

  async initiateCall(userId: string, callType: 'video' | 'audio', remoteUser: CallUser): Promise<void> {
    try {
      this.state.callType = callType;
      this.state.isInitiator = true;
      this.state.remoteUser = remoteUser;
      this.state.callStatus = 'connecting';
      
      await this.getUserMedia();
      await this.createPeerConnection();
      
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);
      
      // Send offer through socket
      (socketService as any).sendCallOffer({
        to: userId,
        offer: offer,
        callType: callType
      });
      
      this.state.callStatus = 'ringing';
      this.emitEvent('callStateChanged', this.state);
      
    } catch (error) {
      console.error('Failed to initiate call:', error);
      this.state.callStatus = 'failed';
      this.emitEvent('callStateChanged', this.state);
      throw error;
    }
  }

  async acceptCall(offer?: RTCSessionDescriptionInit): Promise<void> {
    // If no offer provided, we'll handle it from the stored incoming call data
    if (!offer && !this.pendingOffer) {
      throw new Error('No call offer available');
    }
    
    const callOffer = offer || this.pendingOffer!;
    try {
      this.state.isInitiator = false;
      this.state.callStatus = 'connecting';
      
      await this.getUserMedia();
      await this.createPeerConnection();
      
      await this.peerConnection!.setRemoteDescription(callOffer);
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      
      // Send answer through socket
      (socketService as any).sendCallAnswer({
        to: this.state.remoteUser!.id,
        answer: answer
      });
      
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
      (socketService as any).sendCallRejection({
        to: this.state.remoteUser.id
      });
    }
    this.cleanupCall();
  }

  endCall(): void {
    if (this.state.remoteUser && this.state.isInCall) {
      (socketService as any).sendCallEnd({
        to: this.state.remoteUser.id
      });
    }
    this.cleanupCall();
  }

  toggleVideo(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.state.isVideoEnabled = videoTrack.enabled;
        this.emitEvent('callStateChanged', this.state);
      }
    }
  }

  toggleAudio(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.state.isAudioEnabled = audioTrack.enabled;
        this.emitEvent('callStateChanged', this.state);
      }
    }
  }

  // Private methods
  private async getUserMedia(): Promise<void> {
    // Only available in browser environment
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia not available in this environment');
    }
    
    try {
      const constraints: MediaStreamConstraints = {
        video: this.state.callType === 'video',
        audio: true
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.state.localStream = this.localStream;
      this.emitEvent('localStreamReady', this.localStream);
      
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  private async createPeerConnection(): Promise<void> {
    // Only available in browser environment
    if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') {
      throw new Error('WebRTC not available in this environment');
    }
    
    this.peerConnection = new RTCPeerConnection(this.pcConfig);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0] || null;
      this.state.remoteStream = this.remoteStream;
      this.emitEvent('remoteStreamReady', this.remoteStream);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.state.remoteUser) {
        (socketService as any).sendIceCandidate({
          to: this.state.remoteUser.id,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState;
      console.log('Connection state:', state);
      
      if (state === 'connected') {
        this.state.callStatus = 'connected';
        this.state.isInCall = true;
      } else if (state === 'disconnected' || state === 'failed') {
        this.endCall();
      }
      
      this.emitEvent('callStateChanged', this.state);
    };
  }

  private async handleCallOffer(data: any): Promise<void> {
    const { from, offer, callType } = data;
    
    this.state.remoteUser = { id: from.id, name: from.name, avatar: from.avatar };
    this.state.callType = callType;
    this.state.callStatus = 'ringing';
    this.pendingOffer = offer;
    
    this.emitEvent('incomingCall', {
      caller: this.state.remoteUser,
      callType: callType
    });
  }

  private async handleCallAnswer(data: any): Promise<void> {
    const { answer } = data;
    
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(answer);
      this.state.callStatus = 'connected';
      this.state.isInCall = true;
      this.emitEvent('callStateChanged', this.state);
    }
  }

  private async handleIceCandidate(data: any): Promise<void> {
    const { candidate } = data;
    
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(candidate);
    }
  }

  private handleCallRejected(): void {
    this.state.callStatus = 'ended';
    this.emitEvent('callRejected', {});
    this.cleanupCall();
  }

  private pendingOffer: RTCSessionDescriptionInit | null = null;

  cleanup(): void {
    this.cleanupCall();
  }

  private cleanupCall(): void {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

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

    this.pendingOffer = null;
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


let webrtcServiceInstance: WebRTCService | null = null;

export const webrtcService = {
  getInstance(): WebRTCService {
    if (!webrtcServiceInstance && typeof window !== 'undefined') {
      webrtcServiceInstance = new WebRTCService();
    }
    return webrtcServiceInstance!;
  },
  
  // Proxy methods for backward compatibility
  getState(): CallState {
    if (typeof window === 'undefined') {
      return {
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
    }
    return this.getInstance().getState();
  },
  
  isInCall(): boolean {
    if (typeof window === 'undefined') return false;
    return this.getInstance().isInCall();
  },
  
  async initialize(socketService: any): Promise<void> {
    if (typeof window === 'undefined') return;
    return this.getInstance().initialize(socketService);
  },
  
  async initiateCall(userId: string, callType: 'video' | 'audio', remoteUser: CallUser): Promise<void> {
    if (typeof window === 'undefined') throw new Error('WebRTC not available on server');
    return this.getInstance().initiateCall(userId, callType, remoteUser);
  },
  
  async acceptCall(offer?: RTCSessionDescriptionInit): Promise<void> {
    if (typeof window === 'undefined') throw new Error('WebRTC not available on server');
    return this.getInstance().acceptCall(offer);
  },
  
  rejectCall(): void {
    if (typeof window === 'undefined') return;
    this.getInstance().rejectCall();
  },
  
  endCall(): void {
    if (typeof window === 'undefined') return;
    this.getInstance().endCall();
  },
  
  toggleVideo(): void {
    if (typeof window === 'undefined') return;
    this.getInstance().toggleVideo();
  },
  
  toggleAudio(): void {
    if (typeof window === 'undefined') return;
    this.getInstance().toggleAudio();
  },
  
  on(event: string, callback: CallEventCallback): void {
    if (typeof window === 'undefined') return;
    this.getInstance().on(event, callback);
  },
  
  off(event: string, callback?: CallEventCallback): void {
    if (typeof window === 'undefined') return;
    this.getInstance().off(event, callback);
  },
  
  cleanup(): void {
    if (typeof window === 'undefined') return;
    this.getInstance().cleanup();
  }
};

export type { CallState, CallUser };