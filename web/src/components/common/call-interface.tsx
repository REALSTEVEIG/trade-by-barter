'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { webrtcService, CallState, CallUser } from '@/lib/webrtc';

interface CallInterfaceProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CallInterface({ isVisible, onClose }: CallInterfaceProps): React.ReactElement | null {
  const [callState, setCallState] = useState<CallState>(webrtcService.getState());
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionTime, setConnectionTime] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const connectionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleStateChange = (newState: CallState) => {
      setCallState(newState);
      
      // Start connection timer when call connects
      if (newState.callStatus === 'connected' && !connectionTimerRef.current) {
        connectionTimerRef.current = window.setInterval(() => {
          setConnectionTime(prev => prev + 1);
        }, 1000);
      }
    };

    const handleLocalStream = (stream: MediaStream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };

    const handleRemoteStream = (stream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    const handleCallEnded = () => {
      if (connectionTimerRef.current) {
        clearInterval(connectionTimerRef.current);
        connectionTimerRef.current = null;
      }
      setConnectionTime(0);
      onClose();
    };

    webrtcService.on('callStateChanged', handleStateChange);
    webrtcService.on('localStreamReady', handleLocalStream);
    webrtcService.on('remoteStreamReady', handleRemoteStream);
    webrtcService.on('callEnded', handleCallEnded);

    return () => {
      webrtcService.off('callStateChanged', handleStateChange);
      webrtcService.off('localStreamReady', handleLocalStream);
      webrtcService.off('remoteStreamReady', handleRemoteStream);
      webrtcService.off('callEnded', handleCallEnded);
      
      if (connectionTimerRef.current) {
        clearInterval(connectionTimerRef.current);
      }
    };
  }, [onClose]);

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

  const CallControls = () => (
    <div className="flex items-center justify-center gap-4 p-4">
      <Button
        variant={callState.isAudioEnabled ? "outline" : "destructive"}
        size="icon"
        className="w-12 h-12 rounded-full"
        onClick={handleToggleAudio}
      >
        {callState.isAudioEnabled ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </Button>

      {callState.callType === 'video' && (
        <Button
          variant={callState.isVideoEnabled ? "outline" : "destructive"}
          size="icon"
          className="w-12 h-12 rounded-full"
          onClick={handleToggleVideo}
        >
          {callState.isVideoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>
      )}

      <Button
        variant="destructive"
        size="icon"
        className="w-12 h-12 rounded-full"
        onClick={handleEndCall}
      >
        <PhoneOff className="w-5 h-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-full"
        onClick={handleToggleMinimize}
      >
        {isMinimized ? (
          <Maximize2 className="w-5 h-5" />
        ) : (
          <Minimize2 className="w-5 h-5" />
        )}
      </Button>
    </div>
  );

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 bg-gray-900 text-white border-gray-700 z-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={callState.remoteUser?.avatar} />
                <AvatarFallback>
                  {callState.remoteUser?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{callState.remoteUser?.name}</p>
                <p className="text-xs text-gray-300">
                  {callState.callStatus === 'connected' ? formatTime(connectionTime) : callState.callStatus}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={handleToggleMinimize}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={callState.isAudioEnabled ? "outline" : "destructive"}
              size="sm"
              onClick={handleToggleAudio}
            >
              {callState.isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndCall}
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={callState.remoteUser?.avatar} />
            <AvatarFallback>
              {callState.remoteUser?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white font-medium">{callState.remoteUser?.name}</h3>
            <p className="text-gray-300 text-sm">
              {callState.callStatus === 'connected' ? formatTime(connectionTime) : callState.callStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {callState.callType === 'video' ? (
          <>
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (Picture-in-picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </div>
          </>
        ) : (
          // Audio-only call
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={callState.remoteUser?.avatar} />
                <AvatarFallback className="text-4xl">
                  {callState.remoteUser?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white mb-2">
                {callState.remoteUser?.name}
              </h2>
              <p className="text-gray-300">
                {callState.callStatus === 'connected' ? `Audio Call • ${formatTime(connectionTime)}` : 'Audio Call'}
              </p>
            </div>
          </div>
        )}

        {/* Connection Status Overlay */}
        {callState.callStatus !== 'connected' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-pulse mb-4">
                <Phone className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-xl capitalize">{callState.callStatus}...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/50">
        <CallControls />
      </div>
    </div>
  );
}

// Incoming Call Component
interface IncomingCallProps {
  caller: CallUser;
  callType: 'video' | 'audio';
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCall({ caller, callType, onAccept, onReject }: IncomingCallProps): React.ReactElement {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-96 p-6 text-center bg-white">
        <div className="mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={caller.avatar} />
            <AvatarFallback className="text-2xl">
              {caller.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{caller.name}</h3>
          <p className="text-gray-600">
            Incoming {callType} call
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            variant="destructive"
            size="lg"
            className="w-16 h-16 rounded-full"
            onClick={onReject}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
          
          <Button
            variant="default"
            size="lg"
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600"
            onClick={onAccept}
          >
            <Phone className="w-6 h-6" />
          </Button>
        </div>
      </Card>
    </div>
  );
}