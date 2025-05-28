import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Mic, MicOff, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Guest } from "@/types/streaming";

interface VideoCaptureProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  guests: Guest[];
  className?: string;
}

export const VideoCapture: React.FC<VideoCaptureProps> = ({
  localVideoRef,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  guests,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main host video */}
      <Card className="relative overflow-hidden bg-black">
        <div className="aspect-video">
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
              <CameraOff className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Video controls overlay */}
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
        </div>

        {/* Host label */}
        <div className="absolute top-4 left-4">
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
            You (Host)
          </div>
        </div>
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
                  <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {guest.name}
                  </div>
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
    </div>
  );
};
