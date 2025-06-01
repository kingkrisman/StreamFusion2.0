import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EnhancedVideoCapture } from "@/components/streaming/EnhancedVideoCapture";
import { StreamControls } from "@/components/streaming/StreamControls";
import { PlatformManager } from "@/components/streaming/PlatformManager";
import { LiveChat } from "@/components/streaming/LiveChat";
import { GuestManager } from "@/components/streaming/GuestManager";
import { MediaPermissionError } from "@/components/streaming/MediaPermissionError";
import { StreamAnalytics } from "@/components/streaming/StreamAnalytics";
import { StreamScheduler } from "@/components/streaming/StreamScheduler";
import { StreamOverlays } from "@/components/streaming/StreamOverlays";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useStream } from "@/hooks/useStream";
import { useChat } from "@/hooks/useChat";
import { useScreenShare } from "@/hooks/useScreenShare";
import {
  AlertCircle,
  Settings,
  Users,
  MessageCircle,
  Monitor,
  BarChart3,
  Calendar,
  Layers,
} from "lucide-react";
import { Guest, StreamOverlay } from "@/types/streaming";
import { v4 as uuidv4 } from "uuid";

const Studio: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [scheduledStreams, setScheduledStreams] = useState<any[]>([]);
  const [overlays, setOverlays] = useState<StreamOverlay[]>([]);

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

  const { isScreenSharing, screenVideoRef, startScreenShare, stopScreenShare } =
    useScreenShare();

  const {
    streamState,
    settings,
    setSettings,
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

    // Simulate guest connection after a delay
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

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const handleScheduleStream = (stream: any) => {
    const newStream = { ...stream, id: uuidv4() };
    setScheduledStreams((prev) => [...prev, newStream]);
  };

  const handleDeleteScheduledStream = (id: string) => {
    setScheduledStreams((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddOverlay = (overlay: Omit<StreamOverlay, "id">) => {
    const newOverlay = { ...overlay, id: uuidv4() };
    setOverlays((prev) => [...prev, newOverlay]);
  };

  const handleUpdateOverlay = (id: string, updates: Partial<StreamOverlay>) => {
    setOverlays((prev) =>
      prev.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay,
      ),
    );
  };

  const handleDeleteOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((overlay) => overlay.id !== id));
  };

  if (webRTCError) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Camera Setup Required</h1>
          <p className="text-muted-foreground">
            We need access to your camera and microphone to start streaming.
            Let's get this fixed!
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

  return (
    <>
      <DemoNotification />
      <ConnectionStatus />
      <div className="container mx-auto py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Studio</h1>
            <p className="text-muted-foreground">
              Stream to multiple platforms simultaneously with advanced features
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Video Preview */}
            <EnhancedVideoCapture
              localVideoRef={localVideoRef}
              screenVideoRef={screenVideoRef}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              isScreenSharing={isScreenSharing}
              onToggleVideo={toggleVideo}
              onToggleAudio={toggleAudio}
              onToggleScreenShare={handleToggleScreenShare}
              guests={streamState.guests}
            />

            {/* Stream Controls */}
            <StreamControls
              streamState={streamState}
              onStartStream={handleStartStream}
              onStopStream={handleStopStream}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onDownloadRecording={downloadRecording}
            />
          </div>

          {/* Right Column - Enhanced Management Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="guests" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Guests
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="overlays"
                  className="flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Overlays
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="h-[600px]">
                <LiveChat
                  messages={messages}
                  onSendMessage={sendMessage}
                  className="h-full"
                />
              </TabsContent>

              <TabsContent value="guests" className="h-[600px] overflow-auto">
                <GuestManager
                  guests={streamState.guests}
                  onInviteGuest={handleInviteGuest}
                  onRemoveGuest={removeGuest}
                  onToggleGuestAudio={handleToggleGuestAudio}
                  onToggleGuestVideo={handleToggleGuestVideo}
                />
              </TabsContent>

              <TabsContent
                value="analytics"
                className="h-[600px] overflow-auto"
              >
                <StreamAnalytics
                  viewerCount={streamState.viewerCount}
                  peakViewers={Math.max(streamState.viewerCount, 156)}
                  chatMessages={messages.length}
                  likes={Math.floor(streamState.viewerCount * 0.3)}
                  shares={Math.floor(streamState.viewerCount * 0.1)}
                  duration={streamState.duration}
                  bandwidth={2500}
                  quality={settings.quality}
                />
              </TabsContent>

              <TabsContent value="overlays" className="h-[600px] overflow-auto">
                <StreamOverlays
                  overlays={overlays}
                  onAddOverlay={handleAddOverlay}
                  onUpdateOverlay={handleUpdateOverlay}
                  onDeleteOverlay={handleDeleteOverlay}
                />
              </TabsContent>

              <TabsContent
                value="settings"
                className="h-[600px] overflow-auto space-y-4"
              >
                <PlatformManager
                  platforms={streamState.platforms}
                  onConnect={connectPlatform}
                  onDisconnect={disconnectPlatform}
                  onToggleEnabled={handleTogglePlatform}
                />

                <StreamScheduler
                  scheduledStreams={scheduledStreams}
                  onScheduleStream={handleScheduleStream}
                  onDeleteStream={handleDeleteScheduledStream}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Studio;
