import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileStreamView } from "@/components/streaming/MobileStreamView";
import { StreamControls } from "@/components/streaming/StreamControls";
import { PlatformManager } from "@/components/streaming/PlatformManager";
import { LiveChat } from "@/components/streaming/LiveChat";
import { GuestManager } from "@/components/streaming/GuestManager";
import { MediaPermissionError } from "@/components/streaming/MediaPermissionError";
import { StreamAnalytics } from "@/components/streaming/StreamAnalytics";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useStream } from "@/hooks/useStream";
import { useChat } from "@/hooks/useChat";
import { useMobile } from "@/hooks/use-mobile";
import {
  Users,
  MessageCircle,
  Settings,
  BarChart3,
  Play,
  Square,
} from "lucide-react";
import { Guest } from "@/types/streaming";
import { v4 as uuidv4 } from "uuid";

const MobileStudio: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const isMobile = useMobile();

  const {
    localStream,
    localVideoRef,
    isVideoEnabled,
    isAudioEnabled,
    error: webRTCError,
    isInitializing,
    permissionState,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    stopMedia,
  } = useWebRTC();

  const {
    streamState,
    settings,
    connectPlatform,
    disconnectPlatform,
    addGuest,
    removeGuest,
    updateGuest,
    startStream,
    stopStream,
    startRecording,
    stopRecording,
    downloadRecording,
  } = useStream();

  const { messages, sendMessage } = useChat();

  useEffect(() => {
    if (!isInitialized) {
      initializeMedia();
      setIsInitialized(true);
    }

    return () => {
      if (isInitialized) {
        stopMedia();
      }
    };
  }, [initializeMedia, stopMedia, isInitialized]);

  const handleStartStream = async () => {
    if (localStream) {
      const success = await startStream(localStream);
      if (success && localStream) {
        startRecording(localStream);
      }
    }
  };

  const handleStopStream = () => {
    stopStream();
  };

  const handleStartRecording = () => {
    if (localStream) {
      startRecording(localStream);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleInviteGuest = (name: string, email: string) => {
    const guest: Guest = {
      id: uuidv4(),
      name,
      isConnected: false,
      isMuted: false,
      isVideoOff: false,
    };
    addGuest(guest);

    setTimeout(() => {
      updateGuest(guest.id, { isConnected: true });
    }, 2000);
  };

  const handleToggleGuestAudio = (guestId: string) => {
    const guest = streamState.guests.find((g) => g.id === guestId);
    if (guest) {
      updateGuest(guestId, { isMuted: !guest.isMuted });
    }
  };

  const handleToggleGuestVideo = (guestId: string) => {
    const guest = streamState.guests.find((g) => g.id === guestId);
    if (guest) {
      updateGuest(guestId, { isVideoOff: !guest.isVideoOff });
    }
  };

  const handleTogglePlatform = (platformId: string, enabled: boolean) => {
    const platform = streamState.platforms.find((p) => p.id === platformId);
    if (platform && platform.connected) {
      platform.enabled = enabled;
    }
  };

  if (webRTCError) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Camera Setup Required</h1>
          <p className="text-muted-foreground">
            We need access to your camera and microphone to start streaming.
          </p>
        </div>
        <MediaPermissionError
          error={webRTCError}
          onRetry={initializeMedia}
          permissionState={permissionState}
        />
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="space-y-4">
          <div className="text-lg">Initializing camera and microphone...</div>
          <div className="text-sm text-muted-foreground">
            Please allow access to your camera and microphone when prompted.
          </div>
        </div>
      </div>
    );
  }

  // Render mobile-specific view
  if (isMobile) {
    return (
      <MobileStreamView
        localVideoRef={localVideoRef}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isLive={streamState.isLive}
        viewerCount={streamState.viewerCount}
        duration={streamState.duration}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
      >
        {/* Mobile Sheet Content */}
        <Tabs defaultValue="controls" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="controls">
              <Play className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="guests">
              <Users className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="controls" className="p-4">
            <StreamControls
              streamState={streamState}
              onStartStream={handleStartStream}
              onStopStream={handleStopStream}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onDownloadRecording={downloadRecording}
            />
          </TabsContent>

          <TabsContent value="chat" className="h-[70vh]">
            <LiveChat
              messages={messages}
              onSendMessage={sendMessage}
              className="h-full"
            />
          </TabsContent>

          <TabsContent value="guests" className="p-4 h-[70vh] overflow-auto">
            <GuestManager
              guests={streamState.guests}
              onInviteGuest={handleInviteGuest}
              onRemoveGuest={removeGuest}
              onToggleGuestAudio={handleToggleGuestAudio}
              onToggleGuestVideo={handleToggleGuestVideo}
            />
          </TabsContent>

          <TabsContent value="settings" className="p-4 h-[70vh] overflow-auto">
            <PlatformManager
              platforms={streamState.platforms}
              onConnect={connectPlatform}
              onDisconnect={disconnectPlatform}
              onToggleEnabled={handleTogglePlatform}
            />
          </TabsContent>
        </Tabs>
      </MobileStreamView>
    );
  }

  // Default to desktop Studio view for larger screens
  return <div>Please use the main Studio page on desktop</div>;
};

export default MobileStudio;
