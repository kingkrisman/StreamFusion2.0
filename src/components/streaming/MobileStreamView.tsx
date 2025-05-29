import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Menu,
  Users,
  MessageCircle,
  Settings,
  Monitor,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileStreamViewProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isLive: boolean;
  viewerCount: number;
  duration: number;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  children: React.ReactNode; // For tabs content
}

export const MobileStreamView: React.FC<MobileStreamViewProps> = ({
  localVideoRef,
  isVideoEnabled,
  isAudioEnabled,
  isLive,
  viewerCount,
  duration,
  onToggleVideo,
  onToggleAudio,
  children,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Video Area */}
      <div className="flex-1 relative">
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

        {/* Top Status Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={isLive ? "destructive" : "secondary"}
              className={cn("animate-pulse", isLive && "bg-red-600")}
            >
              {isLive ? "LIVE" : "OFFLINE"}
            </Badge>
            {isLive && (
              <Badge
                variant="outline"
                className="bg-black/50 text-white border-white"
              >
                {formatDuration(duration)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-black/50 text-white border-white"
            >
              <Users className="w-3 h-3 mr-1" />
              {viewerCount}
            </Badge>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black/50 border-white text-white"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full">
                {children}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          <Button
            size="lg"
            variant={isVideoEnabled ? "default" : "destructive"}
            onClick={onToggleVideo}
            className="rounded-full w-14 h-14 p-0"
          >
            {isVideoEnabled ? (
              <Camera className="w-6 h-6" />
            ) : (
              <CameraOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            size="lg"
            variant={isAudioEnabled ? "default" : "destructive"}
            onClick={onToggleAudio}
            className="rounded-full w-14 h-14 p-0"
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
