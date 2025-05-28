import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Link,
  Unlink,
  Youtube,
  Twitch,
  Facebook,
  Twitter,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { StreamPlatform } from "@/types/streaming";
import { cn } from "@/lib/utils";

interface PlatformManagerProps {
  platforms: StreamPlatform[];
  onConnect: (
    platformId: string,
    rtmpUrl: string,
    streamKey: string,
  ) => Promise<boolean>;
  onDisconnect: (platformId: string) => void;
  onToggleEnabled: (platformId: string, enabled: boolean) => void;
  className?: string;
}

const PlatformIcon = ({ platformId }: { platformId: string }) => {
  switch (platformId) {
    case "youtube":
      return <Youtube className="w-5 h-5 text-red-600" />;
    case "twitch":
      return <Twitch className="w-5 h-5 text-purple-600" />;
    case "facebook":
      return <Facebook className="w-5 h-5 text-blue-600" />;
    case "x":
      return <Twitter className="w-5 h-5 text-black" />;
    default:
      return <Settings className="w-5 h-5" />;
  }
};

export const PlatformManager: React.FC<PlatformManagerProps> = ({
  platforms,
  onConnect,
  onDisconnect,
  onToggleEnabled,
  className,
}) => {
  const [selectedPlatform, setSelectedPlatform] =
    useState<StreamPlatform | null>(null);
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConnect = async () => {
    if (!selectedPlatform || !rtmpUrl || !streamKey) return;

    setIsConnecting(true);
    const success = await onConnect(selectedPlatform.id, rtmpUrl, streamKey);

    if (success) {
      setDialogOpen(false);
      setRtmpUrl("");
      setStreamKey("");
      setSelectedPlatform(null);
    }

    setIsConnecting(false);
  };

  const getDefaultRtmpUrl = (platformId: string) => {
    switch (platformId) {
      case "youtube":
        return "rtmp://a.rtmp.youtube.com/live2";
      case "twitch":
        return "rtmp://live.twitch.tv/live";
      case "facebook":
        return "rtmps://live-api-s.facebook.com:443/rtmp";
      case "x":
        return "rtmp://ingest.pscp.tv:80/x";
      default:
        return "";
    }
  };

  const openConnectDialog = (platform: StreamPlatform) => {
    setSelectedPlatform(platform);
    setRtmpUrl(getDefaultRtmpUrl(platform.id));
    setStreamKey("");
    setDialogOpen(true);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Platform Connections
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <PlatformIcon platformId={platform.id} />
              <div>
                <div className="font-medium">{platform.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={platform.connected ? "default" : "secondary"}
                    className={cn(
                      "text-xs",
                      platform.connected && "bg-green-600",
                    )}
                  >
                    {platform.connected ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertCircle className="w-3 h-3 mr-1" />
                    )}
                    {platform.connected ? "Connected" : "Not Connected"}
                  </Badge>

                  {platform.connected && (
                    <Switch
                      checked={platform.enabled}
                      onCheckedChange={(enabled) =>
                        onToggleEnabled(platform.id, enabled)
                      }
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {platform.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDisconnect(platform.id)}
                >
                  <Unlink className="w-4 h-4 mr-1" />
                  Disconnect
                </Button>
              ) : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConnectDialog(platform)}
                    >
                      <Link className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <PlatformIcon platformId={selectedPlatform?.id || ""} />
                        Connect to {selectedPlatform?.name}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rtmp-url">RTMP Server URL</Label>
                        <Input
                          id="rtmp-url"
                          value={rtmpUrl}
                          onChange={(e) => setRtmpUrl(e.target.value)}
                          placeholder="rtmp://..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="stream-key">Stream Key</Label>
                        <Input
                          id="stream-key"
                          type="password"
                          value={streamKey}
                          onChange={(e) => setStreamKey(e.target.value)}
                          placeholder="Your stream key"
                        />
                      </div>

                      <div className="bg-muted p-3 rounded-lg text-sm">
                        <p className="font-medium mb-1">
                          How to get your stream key:
                        </p>
                        <p>
                          Go to your {selectedPlatform?.name} creator dashboard
                          and find the stream settings or live streaming
                          section. Copy your stream key from there.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleConnect}
                          disabled={!rtmpUrl || !streamKey || isConnecting}
                          className="flex-1"
                        >
                          {isConnecting ? "Connecting..." : "Connect"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
