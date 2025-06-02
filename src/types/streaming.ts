export interface StreamPlatform {
  id: string;
  name: string;
  connected: boolean;
  rtmpUrl?: string;
  streamKey?: string;
  enabled: boolean;
}

export interface Guest {
  id: string;
  name: string;
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
}

export interface StreamState {
  isLive: boolean;
  isRecording: boolean;
  platforms: StreamPlatform[];
  guests: Guest[];
  viewerCount: number;
  duration: number;
}

export interface ChatMessage {
  id: string;
  platform: string;
  username: string;
  message: string;
  timestamp: Date;
}

export interface StreamSettings {
  title: string;
  description: string;
  quality: "HD" | "FHD";
  brandingLogo?: string;
  overlays: StreamOverlay[];
}

export interface StreamOverlay {
  id: string;
  type: "logo" | "text" | "image";
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  textStyle?: {
    fontSize: number;
    color: string;
    fontWeight: string;
    textShadow: string;
    fontFamily?: string;
  };
  imageStyle?: {
    opacity: number;
    borderRadius: number;
    border?: string;
  };
  visible: boolean;
}

export interface WebRTCConnection {
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  peerConnection?: RTCPeerConnection;
  isConnected: boolean;
}
