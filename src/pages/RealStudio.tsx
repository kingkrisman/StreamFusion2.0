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
import { QuickFix } from "@/components/streaming/QuickFix";
import { PermissionManager } from "@/components/streaming/PermissionManager";
import { PermissionFixer } from "@/components/streaming/PermissionFixer";
import { StreamAnalytics } from "@/components/streaming/StreamAnalytics";
import { StreamScheduler } from "@/components/streaming/StreamScheduler";
import { StreamOverlays } from "@/components/streaming/StreamOverlays";
import { DemoNotification } from "@/components/DemoNotification";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useRealStream } from "@/hooks/useRealStream";
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

const RealStudio: React.FC = () => {
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
    error: streamError,
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
    inviteGuest,
    sendChatMessage,
  } = useRealStream();

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

  const handleStopStream = async () => {
    await stopStream();
  };

  const handleStartRecording = () => {
    if (localStream) {
      startRecording(localStream);
    }
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleInviteGuest = async (name: string, email: string) => {
    try {
      const guestId = await inviteGuest(name, email);
      console.log(`Guest ${name} invited with ID: ${guestId}`);
    } catch (error) {
      console.error("Failed to invite guest:", error);
    }
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

  const handleSendMessage = async (message: string) => {
    const success = await sendChatMessage(message);
    if (!success) {
      // Fallback to local chat
      sendMessage(message);
    }
  };

  if (webRTCError) {
    // Try to parse error to see if it's a permission issue
    let isPermissionError = false;
    try {
      const errorDetails = JSON.parse(webRTCError);
      isPermissionError = errorDetails.type === "permission";
    } catch {
      isPermissionError =
        webRTCError.includes("Permission denied") ||
        webRTCError.includes("NotAllowedError");
    }

    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {isPermissionError
              ? "Camera Permission Required"
              : "Camera Setup Required"}
          </h1>
          <p className="text-muted-foreground">
            {isPermissionError
              ? "We need permission to access your camera and microphone for streaming."
              : "We need access to your camera and microphone to start streaming. Let's get this fixed!"}
          </p>
        </div>

        {isPermissionError ? (
          <div className="space-y-6">
            <PermissionFixer onRetry={initializeMedia} />

            <details className="group">
              <summary className="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium">
                  Advanced Permission Management
                </span>
              </summary>
              <div className="mt-4 space-y-4">
                <PermissionManager
                  onRetry={initializeMedia}
                  onPermissionGranted={initializeMedia}
                />
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium">
                  Quick Fixes & Troubleshooting
                </span>
              </summary>
              <div className="mt-4 space-y-4">
                <QuickFix onRetry={initializeMedia} />
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium">
                  Comprehensive Browser-Specific Help
                </span>
              </summary>
              <div className="mt-4">
                <MediaPermissionError
                  error={webRTCError}
                  onRetry={initializeMedia}
                  permissionState={permissionState}
                />
              </div>
            </details>
          </div>
        ) : (
          <MediaPermissionError
            error={webRTCError}
            onRetry={initializeMedia}
            permissionState={permissionState}
          />
        )}
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
            <h1 className="text-3xl font-bold">Professional Live Studio</h1>
            <p className="text-muted-foreground">
              Real multi-platform streaming with WebRTC guests and live chat
              integration
            </p>
          </div>
          {streamState.isLive && (
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">🔴 LIVE</div>
              <div className="text-sm text-muted-foreground">
                {streamState.viewerCount} viewers across platforms
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {streamError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{streamError}</AlertDescription>
          </Alert>
        )}

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
              localStream={localStream}
              onRetryCamera={initializeMedia}
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

            {/* Live Stream Info */}
            {streamState.isLive && (
              <Card>
                <CardHeader>
                  <CardTitle>Live Stream Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {streamState.viewerCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Live Viewers
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {messages.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Chat Messages
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {streamState.guests.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Connected Guests
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {
                          streamState.platforms.filter(
                            (p) => p.connected && p.enabled,
                          ).length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Platforms
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  onSendMessage={handleSendMessage}
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

export default RealStudio;
