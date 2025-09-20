import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import {
  Expand,
  Video,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Minimize2
} from 'lucide-react-native';
import { webrtcService, CallState, CallUser } from '../services/webrtc';

const { width } = Dimensions.get('window');

interface CallInterfaceProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CallInterface({ isVisible, onClose }: CallInterfaceProps) {
  const [callState, setCallState] = useState<CallState>(webrtcService.getState());
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionTime, setConnectionTime] = useState(0);

  useEffect(() => {
    const handleStateChange = (newState: CallState) => {
      setCallState(newState);
    };

    const handleCallEnded = () => {
      setConnectionTime(0);
      onClose();
    };

    webrtcService.on('callStateChanged', handleStateChange);
    webrtcService.on('callEnded', handleCallEnded);

    // Start connection timer when call connects
    let timer: NodeJS.Timeout;
    if (callState.callStatus === 'connected') {
      timer = setInterval(() => {
        setConnectionTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      webrtcService.off('callStateChanged', handleStateChange);
      webrtcService.off('callEnded', handleCallEnded);
      if (timer) clearInterval(timer);
    };
  }, [onClose, callState.callStatus]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    webrtcService.endCall();
  };

  const handleToggleVideo = () => {
    webrtcService.toggleVideo();
  };

  const handleToggleAudio = () => {
    webrtcService.toggleAudio();
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isVisible || !callState.isInCall) {
    return null;
  }

  if (isMinimized) {
    return (
      <View style={styles.minimizedContainer}>
        <View style={styles.minimizedContent}>
          <View style={styles.minimizedInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {callState.remoteUser?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.minimizedDetails}>
              <Text style={styles.minimizedName}>{callState.remoteUser?.name}</Text>
              <Text style={styles.minimizedStatus}>
                {callState.callStatus === 'connected' ? formatTime(connectionTime) : callState.callStatus}
              </Text>
            </View>
            <TouchableOpacity onPress={handleToggleMinimize} style={styles.minimizedButton}>
              <Expand size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.minimizedControls}>
            <TouchableOpacity
              onPress={handleToggleAudio}
              style={[styles.miniControlButton, !callState.isAudioEnabled && styles.mutedButton]}
            >
              {callState.isAudioEnabled ? (
                <Mic size={16} color="#FFFFFF" />
              ) : (
                <MicOff size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEndCall} style={styles.endCallMiniButton}>
              <PhoneOff size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide" statusBarTranslucent>
      <StatusBar backgroundColor="#1F2937" barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {callState.remoteUser?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{callState.remoteUser?.name}</Text>
              <Text style={styles.callStatus}>
                {callState.callStatus === 'connected' ? formatTime(connectionTime) : callState.callStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Video/Audio Area */}
        <View style={styles.mediaContainer}>
          {callState.callType === 'video' ? (
            <View style={styles.videoContainer}>
              {/* Remote Video Placeholder */}
              <View style={styles.remoteVideo}>
                <View style={styles.videoPlaceholder}>
                  <Video size={64} color="#6B7280" />
                  <Text style={styles.videoPlaceholderText}>Video Stream</Text>
                </View>
              </View>
              
              {/* Local Video Placeholder (Picture-in-picture) */}
              <View style={styles.localVideo}>
                <View style={styles.localVideoPlaceholder}>
                  <Video size={24} color="#6B7280" />
                </View>
              </View>
            </View>
          ) : (
            // Audio-only call
            <View style={styles.audioCallContainer}>
              <View style={styles.largeAvatarPlaceholder}>
                <Text style={styles.largeAvatarText}>
                  {callState.remoteUser?.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.audioCallName}>{callState.remoteUser?.name}</Text>
              <Text style={styles.audioCallStatus}>
                {callState.callStatus === 'connected' ? `Audio Call • ${formatTime(connectionTime)}` : 'Audio Call'}
              </Text>
            </View>
          )}

          {/* Connection Status Overlay */}
          {callState.callStatus !== 'connected' && (
            <View style={styles.statusOverlay}>
              <View style={styles.statusContent}>
                <Phone size={48} color="#FFFFFF" />
                <Text style={styles.statusText}>{callState.callStatus}...</Text>
              </View>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleToggleAudio}
            style={[styles.controlButton, !callState.isAudioEnabled && styles.mutedButton]}
          >
            {callState.isAudioEnabled ? (
              <Mic size={24} color="#FFFFFF" />
            ) : (
              <MicOff size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          {callState.callType === 'video' && (
            <TouchableOpacity
              onPress={handleToggleVideo}
              style={[styles.controlButton, !callState.isVideoEnabled && styles.mutedButton]}
            >
              {callState.isVideoEnabled ? (
                <Video size={24} color="#FFFFFF" />
              ) : (
                <Video size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleEndCall} style={styles.endCallButton}>
            <PhoneOff size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleToggleMinimize} style={styles.controlButton}>
            <Minimize2 size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Incoming Call Component
interface IncomingCallProps {
  caller: CallUser;
  callType: 'video' | 'audio';
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCall({ caller, callType, onAccept, onReject }: IncomingCallProps) {
  return (
    <Modal visible={true} animationType="fade" transparent statusBarTranslucent>
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      <View style={styles.incomingCallOverlay}>
        <View style={styles.incomingCallContainer}>
          <View style={styles.incomingCallContent}>
            <View style={styles.largeAvatarPlaceholder}>
              <Text style={styles.largeAvatarText}>
                {caller.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.incomingCallerName}>{caller.name}</Text>
            <Text style={styles.incomingCallType}>
              Incoming {callType} call
            </Text>
          </View>

          <View style={styles.incomingCallActions}>
            <TouchableOpacity onPress={onReject} style={styles.rejectButton}>
              <PhoneOff size={32} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onAccept} style={styles.acceptButton}>
              <Phone size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  callStatus: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  mediaContainer: {
    flex: 1,
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#374151',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 8,
  },
  localVideo: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 120,
    height: 160,
    backgroundColor: '#374151',
    borderRadius: 8,
    overflow: 'hidden',
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioCallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  largeAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAvatarText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  audioCallName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  audioCallStatus: {
    color: '#D1D5DB',
    fontSize: 16,
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContent: {
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 16,
    textTransform: 'capitalize',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedButton: {
    backgroundColor: '#EF4444',
  },
  endCallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimizedContainer: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    minWidth: 280,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  minimizedContent: {
    gap: 12,
  },
  minimizedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimizedDetails: {
    flex: 1,
    marginLeft: 8,
  },
  minimizedName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  minimizedStatus: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  minimizedButton: {
    padding: 4,
  },
  minimizedControls: {
    flexDirection: 'row',
    gap: 8,
  },
  miniControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallMiniButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingCallOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingCallContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
    alignItems: 'center',
  },
  incomingCallContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  incomingCallerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  incomingCallType: {
    fontSize: 16,
    color: '#6B7280',
  },
  incomingCallActions: {
    flexDirection: 'row',
    gap: 32,
  },
  rejectButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
});