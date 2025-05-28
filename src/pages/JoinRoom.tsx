import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VideoCapture } from "@/components/streaming/VideoCapture";
import { useWebRTC } from "@/hooks/useWebRTC";
import {
  Users,
  Camera,
  Mic,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

const JoinRoom: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [guestName, setGuestName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [hostName, setHostName] = useState("Demo Stream Host");

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

  useEffect(() => {
    initializeMedia();

    return () => {
      stopMedia();
    };
  }, [initializeMedia, stopMedia]);

  const handleJoinStream = async () => {
    if (!guestName.trim()) return;

    setIsJoining(true);

    // Simulate joining process
    setTimeout(() => {
      setIsJoined(true);
      setIsJoining(false);
    }, 2000);
  };

  const handleLeaveStream = () => {
    setIsJoined(false);
    stopMedia();
    navigate("/");
  };

  if (!roomId) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid room link. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Join Live Stream</h1>
        <p className="text-muted-foreground">
          You've been invited to join {hostName}'s live stream
        </p>
      </div>

      {isJoined ? (
        /* Joined State */
        <div className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You're now connected to the live stream! The host can see and hear
              you.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Preview */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Video</h3>
              <VideoCapture
                localVideoRef={localVideoRef}
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                onToggleVideo={toggleVideo}
                onToggleAudio={toggleAudio}
                guests={[]}
              />
            </div>

            {/* Stream Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Stream Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Host</Label>
                    <div className="font-medium">{hostName}</div>
                  </div>

                  <div>
                    <Label>Your Name</Label>
                    <div className="font-medium">{guestName}</div>
                  </div>

                  <div>
                    <Label>Room ID</Label>
                    <div className="font-mono text-sm">{roomId}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stream Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• The host controls when you appear on the live stream</p>
                  <p>• Be respectful and follow the host's instructions</p>
                  <p>
                    • You can mute yourself or turn off your camera at any time
                  </p>
                  <p>• The host may mute you or disable your video if needed</p>
                </CardContent>
              </Card>

              <Button
                onClick={handleLeaveStream}
                variant="destructive"
                className="w-full"
              >
                Leave Stream
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Join Form */
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Setup Your Camera & Microphone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isInitializing ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Setting up your camera and microphone...</p>
                </div>
              ) : (
                <>
                  {/* Video Preview */}
                  <div>
                    <Label className="text-base">Video Preview</Label>
                    <div className="mt-2">
                      <VideoCapture
                        localVideoRef={localVideoRef}
                        isVideoEnabled={isVideoEnabled}
                        isAudioEnabled={isAudioEnabled}
                        onToggleVideo={toggleVideo}
                        onToggleAudio={toggleAudio}
                        guests={[]}
                      />
                    </div>
                  </div>

                  {/* Guest Name Input */}
                  <div>
                    <Label htmlFor="guest-name" className="text-base">
                      Your Name
                    </Label>
                    <Input
                      id="guest-name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      className="mt-2"
                    />
                  </div>

                  {/* Device Check */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Device Check</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span>
                          Camera: {localStream ? "Connected" : "Not connected"}
                        </span>
                        {localStream && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        <span>
                          Microphone:{" "}
                          {localStream ? "Connected" : "Not connected"}
                        </span>
                        {localStream && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Join Button */}
                  <Button
                    onClick={handleJoinStream}
                    disabled={!guestName.trim() || !localStream || isJoining}
                    className="w-full"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining Stream...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Join Stream
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JoinRoom;
