import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VideoCapture } from "@/components/streaming/VideoCapture";
import { StreamControls } from "@/components/streaming/StreamControls";
import { PlatformManager } from "@/components/streaming/PlatformManager";
import { LiveChat } from "@/components/streaming/LiveChat";
import { GuestManager } from "@/components/streaming/GuestManager";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useStream } from "@/hooks/useStream";
import { useChat } from "@/hooks/useChat";
import {
  AlertCircle,
  Settings,
  Users,
  MessageCircle,
  Monitor,
} from "lucide-react";
import { Guest } from "@/types/streaming";
import { v4 as uuidv4 } from "uuid";

const Studio: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    localStream,
    localVideoRef,
    isVideoEnabled,
    isAudioEnabled,
    error: webRTCError,
    isInitializing,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    stopMedia,
  } = useWebRTC();

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

  if (webRTCError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{webRTCError}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={initializeMedia}>Try Again</Button>
        </div>
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
    <div className="container mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Studio</h1>
          <p className="text-muted-foreground">
            Stream to multiple platforms simultaneously
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Video & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          <VideoCapture
            localVideoRef={localVideoRef}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
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

        {/* Right Column - Chat & Management */}
        <div className="space-y-6">
          <Tabs defaultValue="chat" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="guests" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Guests
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
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

            <TabsContent value="settings" className="h-[600px] overflow-auto">
              <PlatformManager
                platforms={streamState.platforms}
                onConnect={connectPlatform}
                onDisconnect={disconnectPlatform}
                onToggleEnabled={handleTogglePlatform}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Studio;
