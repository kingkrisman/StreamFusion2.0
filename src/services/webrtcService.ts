interface PeerConnection {
  id: string;
  pc: RTCPeerConnection;
  stream?: MediaStream;
  isHost: boolean;
}

interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate" | "join-room" | "leave-room";
  data: any;
  fromId: string;
  toId?: string;
  roomId: string;
}

class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private signalingSocket: WebSocket | null = null;
  private roomId: string | null = null;
  private isHost: boolean = false;
  private onRemoteStreamCallback?: (
    peerId: string,
    stream: MediaStream,
  ) => void;
  private onPeerDisconnectedCallback?: (peerId: string) => void;

  constructor() {
    this.initializeSignaling();
  }

  private initializeSignaling() {
    const signalingUrl =
      import.meta.env.MODE === "production"
        ? "wss://signaling-server.fly.dev"
        : "ws://localhost:8081";

    try {
      this.signalingSocket = new WebSocket(signalingUrl);

      this.signalingSocket.onopen = () => {
        console.log("Connected to signaling server");
      };

      this.signalingSocket.onmessage = (event) => {
        const message: SignalingMessage = JSON.parse(event.data);
        this.handleSignalingMessage(message);
      };

      this.signalingSocket.onclose = () => {
        console.log("Disconnected from signaling server");
        setTimeout(() => this.initializeSignaling(), 5000);
      };

      this.signalingSocket.onerror = (error) => {
        console.error("Signaling error:", error);
      };
    } catch (error) {
      console.error("Failed to connect to signaling server:", error);
    }
  }

  private async handleSignalingMessage(message: SignalingMessage) {
    switch (message.type) {
      case "offer":
        await this.handleOffer(message);
        break;
      case "answer":
        await this.handleAnswer(message);
        break;
      case "ice-candidate":
        await this.handleIceCandidate(message);
        break;
      case "join-room":
        await this.handlePeerJoined(message);
        break;
      case "leave-room":
        this.handlePeerLeft(message);
        break;
    }
  }

  async createRoom(roomId: string, localStream: MediaStream): Promise<boolean> {
    try {
      this.roomId = roomId;
      this.isHost = true;
      this.localStream = localStream;

      if (
        this.signalingSocket &&
        this.signalingSocket.readyState === WebSocket.OPEN
      ) {
        this.signalingSocket.send(
          JSON.stringify({
            type: "create-room",
            roomId,
            isHost: true,
          }),
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to create room:", error);
      return false;
    }
  }

  async joinRoom(roomId: string, localStream: MediaStream): Promise<boolean> {
    try {
      this.roomId = roomId;
      this.isHost = false;
      this.localStream = localStream;

      if (
        this.signalingSocket &&
        this.signalingSocket.readyState === WebSocket.OPEN
      ) {
        this.signalingSocket.send(
          JSON.stringify({
            type: "join-room",
            roomId,
            isHost: false,
          }),
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to join room:", error);
      return false;
    }
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // Add TURN servers for production
        {
          urls: "turn:turnserver.example.com:3478",
          username: "username",
          credential: "password",
        },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(peerId, remoteStream);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.signalingSocket) {
        this.signalingSocket.send(
          JSON.stringify({
            type: "ice-candidate",
            data: event.candidate,
            fromId: this.generatePeerId(),
            toId: peerId,
            roomId: this.roomId!,
          }),
        );
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Peer ${peerId} connection state:`, pc.connectionState);
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        this.removePeerConnection(peerId);
      }
    };

    const peerConnection: PeerConnection = {
      id: peerId,
      pc,
      isHost: this.isHost,
    };

    this.peerConnections.set(peerId, peerConnection);
    return pc;
  }

  private async handlePeerJoined(message: SignalingMessage) {
    if (!this.isHost) return;

    const peerId = message.fromId;
    const pc = this.createPeerConnection(peerId);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (this.signalingSocket) {
        this.signalingSocket.send(
          JSON.stringify({
            type: "offer",
            data: offer,
            fromId: this.generatePeerId(),
            toId: peerId,
            roomId: this.roomId!,
          }),
        );
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  private async handleOffer(message: SignalingMessage) {
    const peerId = message.fromId;
    const pc = this.createPeerConnection(peerId);

    try {
      await pc.setRemoteDescription(message.data);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (this.signalingSocket) {
        this.signalingSocket.send(
          JSON.stringify({
            type: "answer",
            data: answer,
            fromId: this.generatePeerId(),
            toId: peerId,
            roomId: this.roomId!,
          }),
        );
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  private async handleAnswer(message: SignalingMessage) {
    const peerId = message.fromId;
    const peerConnection = this.peerConnections.get(peerId);

    if (peerConnection) {
      try {
        await peerConnection.pc.setRemoteDescription(message.data);
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  }

  private async handleIceCandidate(message: SignalingMessage) {
    const peerId = message.fromId;
    const peerConnection = this.peerConnections.get(peerId);

    if (peerConnection) {
      try {
        await peerConnection.pc.addIceCandidate(message.data);
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  }

  private handlePeerLeft(message: SignalingMessage) {
    const peerId = message.fromId;
    this.removePeerConnection(peerId);

    if (this.onPeerDisconnectedCallback) {
      this.onPeerDisconnectedCallback(peerId);
    }
  }

  private removePeerConnection(peerId: string) {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.pc.close();
      this.peerConnections.delete(peerId);
    }
  }

  private generatePeerId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onRemoteStream(callback: (peerId: string, stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  onPeerDisconnected(callback: (peerId: string) => void) {
    this.onPeerDisconnectedCallback = callback;
  }

  leaveRoom() {
    if (this.signalingSocket && this.roomId) {
      this.signalingSocket.send(
        JSON.stringify({
          type: "leave-room",
          roomId: this.roomId,
          fromId: this.generatePeerId(),
        }),
      );
    }

    // Close all peer connections
    this.peerConnections.forEach((pc) => pc.pc.close());
    this.peerConnections.clear();

    this.roomId = null;
    this.isHost = false;
  }

  toggleLocalVideo(enabled: boolean) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  toggleLocalAudio(enabled: boolean) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  async replaceVideoTrack(newVideoTrack: MediaStreamTrack) {
    if (!this.localStream) return;

    // Replace track in local stream
    const oldVideoTrack = this.localStream.getVideoTracks()[0];
    if (oldVideoTrack) {
      this.localStream.removeTrack(oldVideoTrack);
      oldVideoTrack.stop();
    }
    this.localStream.addTrack(newVideoTrack);

    // Replace track in all peer connections
    for (const peerConnection of this.peerConnections.values()) {
      const sender = peerConnection.pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender) {
        await sender.replaceTrack(newVideoTrack);
      }
    }
  }
}

export const webrtcService = new WebRTCService();
