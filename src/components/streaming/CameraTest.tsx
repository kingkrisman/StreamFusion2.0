import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Play,
  Square,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraTestProps {
  className?: string;
}

export const CameraTest: React.FC<CameraTestProps> = ({ className }) => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Get available devices
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList);

        const cameras = deviceList.filter(
          (device) => device.kind === "videoinput",
        );
        const microphones = deviceList.filter(
          (device) => device.kind === "audioinput",
        );

        if (cameras.length > 0 && !selectedCamera) {
          setSelectedCamera(cameras[0].deviceId);
        }
        if (microphones.length > 0 && !selectedMicrophone) {
          setSelectedMicrophone(microphones[0].deviceId);
        }
      } catch (err) {
        console.error("Error getting devices:", err);
      }
    };

    getDevices();
  }, [selectedCamera, selectedMicrophone]);

  const startCamera = async () => {
    try {
      setError(null);

      const constraints: MediaStreamConstraints = {
        video: selectedCamera ? { deviceId: selectedCamera } : true,
        audio: selectedMicrophone ? { deviceId: selectedMicrophone } : true,
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Error starting camera:", err);
      setError(err.message || "Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setError(null);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const cameraDevices = devices.filter(
    (device) => device.kind === "videoinput",
  );
  const microphoneDevices = devices.filter(
    (device) => device.kind === "audioinput",
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Camera Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Camera</label>
            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger>
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {cameraDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Microphone</label>
            <Select
              value={selectedMicrophone}
              onValueChange={setSelectedMicrophone}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {microphoneDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label ||
                      `Microphone ${device.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Video Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            className={cn(
              "w-full h-full object-cover",
              !isVideoEnabled && "opacity-0",
            )}
            autoPlay
            muted
            playsInline
          />

          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-gray-400">
                <Camera className="w-16 h-16 mx-auto mb-4" />
                <p>Camera not active</p>
              </div>
            </div>
          )}

          {!isVideoEnabled && isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <CameraOff className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Status badges */}
          {isActive && (
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge
                variant="outline"
                className="bg-black/50 text-white border-white"
              >
                Live Test
              </Badge>
            </div>
          )}

          {/* Controls */}
          {isActive && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button
                size="sm"
                variant={isVideoEnabled ? "default" : "destructive"}
                onClick={toggleVideo}
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
                onClick={toggleAudio}
                className="rounded-full w-10 h-10 p-0"
              >
                {isAudioEnabled ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={startCamera} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Camera Test
            </Button>
          ) : (
            <Button
              onClick={stopCamera}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Test
            </Button>
          )}
        </div>

        {/* Device Info */}
        <div className="text-xs text-gray-500 text-center">
          Found {cameraDevices.length} camera(s) and {microphoneDevices.length}{" "}
          microphone(s)
        </div>
      </CardContent>
    </Card>
  );
};
