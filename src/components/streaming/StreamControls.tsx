import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Square,
  Circle,
  StopCircle,
  Users,
  Eye,
  Clock,
  Download,
} from "lucide-react";
import { StreamState } from "@/types/streaming";
import { cn } from "@/lib/utils";

interface StreamControlsProps {
  streamState: StreamState;
  onStartStream: () => void;
  onStopStream: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDownloadRecording: () => void;
  className?: string;
}

export const StreamControls: React.FC<StreamControlsProps> = ({
  streamState,
  onStartStream,
  onStopStream,
  onStartRecording,
  onStopRecording,
  onDownloadRecording,
  className,
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const connectedPlatforms = streamState.platforms.filter(
    (p) => p.connected && p.enabled,
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Stream Controls</span>
          <div className="flex items-center gap-2">
            <Badge
              variant={streamState.isLive ? "destructive" : "secondary"}
              className={cn(
                "animate-pulse",
                streamState.isLive && "bg-red-600",
              )}
            >
              {streamState.isLive ? "LIVE" : "OFFLINE"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Stream Controls */}
        <div className="space-y-4">
          <div className="flex gap-3">
            {!streamState.isLive ? (
              <Button
                onClick={onStartStream}
                disabled={connectedPlatforms.length === 0}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Go Live
              </Button>
            ) : (
              <Button
                onClick={onStopStream}
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                End Stream
              </Button>
            )}

            {!streamState.isRecording ? (
              <Button
                onClick={onStartRecording}
                variant="outline"
                disabled={!streamState.isLive}
              >
                <Circle className="w-4 h-4 mr-2 text-red-600" />
                Record
              </Button>
            ) : (
              <Button
                onClick={onStopRecording}
                variant="outline"
                className="text-red-600 border-red-600"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Rec
              </Button>
            )}

            <Button onClick={onDownloadRecording} variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {connectedPlatforms.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Connect to at least one platform to start streaming
            </p>
          )}
        </div>

        <Separator />

        {/* Stream Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Clock className="w-4 h-4 mr-1" />
            </div>
            <div className="font-mono text-sm font-medium">
              {formatDuration(streamState.duration)}
            </div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>

          <div>
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Eye className="w-4 h-4 mr-1" />
            </div>
            <div className="font-mono text-sm font-medium">
              {streamState.viewerCount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Viewers</div>
          </div>

          <div>
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Users className="w-4 h-4 mr-1" />
            </div>
            <div className="font-mono text-sm font-medium">
              {streamState.guests.length}
            </div>
            <div className="text-xs text-muted-foreground">Guests</div>
          </div>
        </div>

        <Separator />

        {/* Platform Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Streaming To:</h4>
          {connectedPlatforms.length > 0 ? (
            <div className="space-y-2">
              {connectedPlatforms.map((platform) => (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <span className="text-sm font-medium">{platform.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-muted-foreground">
                      Connected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No platforms connected
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
