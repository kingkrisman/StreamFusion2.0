import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Key,
  Zap,
} from "lucide-react";
import { StreamPlatform } from "@/types/streaming";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";

interface RealPlatformManagerProps {
  platforms: StreamPlatform[];
  onConnect: (
    platformId: string,
    rtmpUrl?: string,
    streamKey?: string,
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

export const RealPlatformManager: React.FC<RealPlatformManagerProps> = ({
  platforms,
  onConnect,
  onDisconnect,
  onToggleEnabled,
  className,
}) => {
  const [selectedPlatform, setSelectedPlatform] =
    useState<StreamPlatform | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<"oauth" | "rtmp">(
    "oauth",
  );
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOAuthConnect = async (platform: StreamPlatform) => {
    setIsConnecting(true);
    try {
      const success = await onConnect(platform.id);
      if (success) {
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("OAuth connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRTMPConnect = async () => {
    if (!selectedPlatform || !rtmpUrl || !streamKey) return;

    setIsConnecting(true);
    try {
      const success = await onConnect(selectedPlatform.id, rtmpUrl, streamKey);
      if (success) {
        setDialogOpen(false);
        setRtmpUrl("");
        setStreamKey("");
        setSelectedPlatform(null);
      }
    } catch (error) {
      console.error("RTMP connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
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
    setConnectionMethod("oauth");
    setDialogOpen(true);
  };

  const getPlatformInstructions = (platformId: string) => {
    switch (platformId) {
      case "youtube":
        return {
          oauth:
            "Connect with Google OAuth to automatically sync your YouTube channel and manage live streams.",
          rtmp: "Go to YouTube Studio → Go Live → Stream tab → Copy your Stream URL and Stream Key.",
        };
      case "twitch":
        return {
          oauth:
            "Connect with Twitch OAuth to access your channel and manage streams automatically.",
          rtmp: "Go to Twitch Dashboard → Settings → Stream → Copy your Primary Stream key.",
        };
      case "facebook":
        return {
          oauth:
            "Connect with Facebook OAuth to manage Facebook Live streams from your pages.",
          rtmp: "Go to Facebook Creator Studio → Live → Create Live Video → Copy Stream Key.",
        };
      case "x":
        return {
          oauth:
            "Connect with X OAuth to manage X Live streams (Spaces replacement).",
          rtmp: "Go to X Media Studio → Producer → Live → Copy your RTMP credentials.",
        };
      default:
        return { oauth: "", rtmp: "" };
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Real Platform Connections
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {platforms.map((platform) => {
          const instructions = getPlatformInstructions(platform.id);

          return (
            <div
              key={platform.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white"
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

                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <PlatformIcon
                            platformId={selectedPlatform?.id || ""}
                          />
                          Connect to {selectedPlatform?.name}
                        </DialogTitle>
                      </DialogHeader>

                      <Tabs
                        value={connectionMethod}
                        onValueChange={(value) =>
                          setConnectionMethod(value as "oauth" | "rtmp")
                        }
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="oauth">
                            OAuth (Recommended)
                          </TabsTrigger>
                          <TabsTrigger value="rtmp">Manual RTMP</TabsTrigger>
                        </TabsList>

                        <TabsContent value="oauth" className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">
                              OAuth Connection
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                              {instructions.oauth}
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Automatic stream key management</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Real-time chat integration</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Viewer count synchronization</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Stream analytics</span>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() =>
                              selectedPlatform &&
                              handleOAuthConnect(selectedPlatform)
                            }
                            disabled={isConnecting}
                            className="w-full"
                          >
                            {isConnecting
                              ? "Connecting..."
                              : `Connect with ${selectedPlatform?.name} OAuth`}
                          </Button>
                        </TabsContent>

                        <TabsContent value="rtmp" className="space-y-4">
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">
                              Manual RTMP Setup
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {instructions.rtmp}
                            </p>
                            <p className="text-xs text-yellow-700">
                              Note: Manual RTMP connections have limited
                              features compared to OAuth.
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="rtmp-url">RTMP Server URL</Label>
                            <Input
                              id="rtmp-url"
                              value={rtmpUrl}
                              onChange={(e) => setRtmpUrl(e.target.value)}
                              placeholder="rtmp://..."
                              className="font-mono text-sm"
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
                              className="font-mono text-sm"
                            />
                          </div>

                          <Button
                            onClick={handleRTMPConnect}
                            disabled={!rtmpUrl || !streamKey || isConnecting}
                            className="w-full"
                          >
                            <Key className="w-4 h-4 mr-2" />
                            {isConnecting
                              ? "Connecting..."
                              : "Connect with RTMP"}
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          );
        })}

        {/* Connection Status Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Connection Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Connected Platforms:</span>
              <span className="font-medium ml-2">
                {platforms.filter((p) => p.connected).length} /{" "}
                {platforms.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Active for Streaming:</span>
              <span className="font-medium ml-2">
                {platforms.filter((p) => p.connected && p.enabled).length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
