import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VideoDebugger } from "./VideoDebugger";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Users,
  Monitor,
  MonitorX,
  Settings,
  Maximize,
  PictureInPicture,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Guest } from "@/types/streaming";

interface EnhancedVideoCaptureProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  screenVideoRef?: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  guests: Guest[];
  className?: string;
  localStream?: MediaStream | null;
  onRetryCamera?: () => void;
}

export const EnhancedVideoCapture: React.FC<EnhancedVideoCaptureProps> = ({
  localVideoRef,
  screenVideoRef,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  guests,
  className,
  localStream,
  onRetryCamera,
}) => {
  const [viewMode, setViewMode] = React.useState<"camera" | "screen" | "pip">(
    "camera",
  );
  const [showDebugger, setShowDebugger] = useState(false);
  const [videoIssueDetected, setVideoIssueDetected] = useState(false);

  // Monitor video element for black screen or issues
  useEffect(() => {
    if (!localVideoRef.current || !localStream) return;

    const video = localVideoRef.current;
    let checkInterval: NodeJS.Timeout;

    const checkVideoStatus = () => {
      const hasVideoTracks = localStream.getVideoTracks().length > 0;
      const isVideoReady = video.readyState >= 2;
      const isVideoPlaying =
        !video.paused && !video.ended && video.currentTime > 0;
      const hasValidDimensions = video.videoWidth > 0 && video.videoHeight > 0;

      const hasIssue =
        hasVideoTracks &&
        isVideoEnabled &&
        (!isVideoReady || !isVideoPlaying || !hasValidDimensions);

      if (hasIssue !== videoIssueDetected) {
        setVideoIssueDetected(hasIssue);
        if (hasIssue) {
          console.warn("Video issue detected:", {
            hasVideoTracks,
            isVideoEnabled,
            isVideoReady,
            isVideoPlaying,
            hasValidDimensions,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState,
          });
        }
      }
    };

    // Check immediately and then every 2 seconds
    checkVideoStatus();
    checkInterval = setInterval(checkVideoStatus, 2000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [localStream, isVideoEnabled, videoIssueDetected, localVideoRef]);

  const handleVideoClick = () => {
    // Try to play video on user interaction (for autoplay restrictions)
    if (localVideoRef.current) {
      localVideoRef.current.play().catch(console.error);
    }
  };

  const switchViewMode = () => {
    if (isScreenSharing) {
      setViewMode((prev) => {
        if (prev === "camera") return "screen";
        if (prev === "screen") return "pip";
        return "camera";
      });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main video area */}
      <Card className="relative overflow-hidden bg-black">
        <div className="aspect-video relative">
          {/* Camera view */}
          {(viewMode === "camera" || !isScreenSharing) && (
            <div className="relative w-full h-full">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                onClick={handleVideoClick}
                className={cn(
                  "w-full h-full object-cover cursor-pointer",
                  !isVideoEnabled && "opacity-0",
                )}
              />

              {/* Video issue overlay */}
              {videoIssueDetected && isVideoEnabled && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                    <h3 className="text-lg font-semibold mb-2">
                      Camera Issue Detected
                    </h3>
                    <p className="text-sm mb-4">
                      Your camera appears to be connected but not displaying
                      video.
                    </p>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        onClick={handleVideoClick}
                        className="mr-2"
                      >
                        Click to Play
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDebugger(true)}
                      >
                        <Wrench className="w-4 h-4 mr-1" />
                        Debug
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Screen share view */}
          {viewMode === "screen" && isScreenSharing && screenVideoRef && (
            <video
              ref={screenVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          )}

          {/* Picture-in-picture view */}
          {viewMode === "pip" && isScreenSharing && screenVideoRef && (
            <>
              <video
                ref={screenVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={cn(
                    "w-full h-full object-cover",
                    !isVideoEnabled && "opacity-0",
                  )}
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <CameraOff className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </>
          )}

          {/* No video state */}
          {!isVideoEnabled && viewMode === "camera" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <CameraOff className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Main controls overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <Button
            size="sm"
            variant={isVideoEnabled ? "default" : "destructive"}
            onClick={onToggleVideo}
            className="rounded-full w-10 h-10 p-0"
          >
            {isVideoEnabled ? (
              <Camera className="w-4 h-4" />
            ) : (
              <CameraOff className="w-4 h-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant={isAudioEnabled ? "default" : "destructive"}
            onClick={onToggleAudio}
            className="rounded-full w-10 h-10 p-0"
          >
            {isAudioEnabled ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant={isScreenSharing ? "default" : "outline"}
            onClick={onToggleScreenShare}
            className="rounded-full w-10 h-10 p-0"
          >
            {isScreenSharing ? (
              <MonitorX className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
          </Button>

          {isScreenSharing && (
            <Button
              size="sm"
              variant="outline"
              onClick={switchViewMode}
              className="rounded-full w-10 h-10 p-0"
            >
              {viewMode === "pip" ? (
                <Maximize className="w-4 h-4" />
              ) : (
                <PictureInPicture className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="rounded-full w-10 h-10 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Status indicators */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-blue-600 text-white">You (Host)</Badge>
          {isScreenSharing && (
            <Badge className="bg-green-600 text-white">
              <Monitor className="w-3 h-3 mr-1" />
              Screen Sharing
            </Badge>
          )}
        </div>

        {/* View mode indicator */}
        {isScreenSharing && (
          <div className="absolute top-4 right-4">
            <Badge
              variant="outline"
              className="bg-black/50 text-white border-white"
            >
              {viewMode === "camera" && "Camera View"}
              {viewMode === "screen" && "Screen View"}
              {viewMode === "pip" && "Picture-in-Picture"}
            </Badge>
          </div>
        )}
      </Card>

      {/* Guest videos */}
      {guests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users className="w-4 h-4" />
            Guests ({guests.length})
          </div>

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns:
                guests.length === 1
                  ? "1fr"
                  : guests.length === 2
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
            }}
          >
            {guests.map((guest) => (
              <Card
                key={guest.id}
                className="relative overflow-hidden bg-black"
              >
                <div className="aspect-video">
                  {guest.stream ? (
                    <video
                      autoPlay
                      playsInline
                      className={cn(
                        "w-full h-full object-cover",
                        guest.isVideoOff && "opacity-0",
                      )}
                      ref={(video) => {
                        if (video && guest.stream) {
                          video.srcObject = guest.stream;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <div className="text-center text-gray-400">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Connecting...</p>
                      </div>
                    </div>
                  )}

                  {guest.isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <CameraOff className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Guest info */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-600 text-white text-xs">
                    {guest.name}
                  </Badge>
                </div>

                {/* Audio indicator */}
                {guest.isMuted && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-red-600 text-white p-1 rounded">
                      <MicOff className="w-3 h-3" />
                    </div>
                  </div>
                )}

                {/* Connection status */}
                <div
                  className={cn(
                    "absolute bottom-2 right-2 w-2 h-2 rounded-full",
                    guest.isConnected ? "bg-green-500" : "bg-red-500",
                  )}
                />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick tips */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>💡 Click the monitor icon to share your screen</p>
        {isScreenSharing && (
          <p>
            🔄 Click the view mode button to switch between camera and screen
            views
          </p>
        )}
      </div>
    </div>
  );
};
