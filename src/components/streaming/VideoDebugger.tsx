import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Mic,
  Info,
  Wrench,
} from "lucide-react";

interface VideoDebuggerProps {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  onRetry: () => void;
}

export const VideoDebugger: React.FC<VideoDebuggerProps> = ({
  stream,
  videoRef,
  onRetry,
}) => {
  const [debugInfo, setDebugInfo] = useState<{
    streamStatus: string;
    videoTracks: number;
    audioTracks: number;
    videoSettings: any;
    videoElementStatus: string;
    videoElementError: string | null;
    camerasAvailable: number;
    isVideoPlaying: boolean;
  }>({
    streamStatus: "No stream",
    videoTracks: 0,
    audioTracks: 0,
    videoSettings: null,
    videoElementStatus: "Not ready",
    videoElementError: null,
    camerasAvailable: 0,
    isVideoPlaying: false,
  });

  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const updateDebugInfo = async () => {
      const info = {
        streamStatus: "No stream",
        videoTracks: 0,
        audioTracks: 0,
        videoSettings: null,
        videoElementStatus: "Not ready",
        videoElementError: null,
        camerasAvailable: 0,
        isVideoPlaying: false,
      };

      // Check stream status
      if (stream) {
        info.streamStatus = stream.active ? "Active" : "Inactive";
        info.videoTracks = stream.getVideoTracks().length;
        info.audioTracks = stream.getAudioTracks().length;

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          info.videoSettings = videoTrack.getSettings();
        }
      }

      // Check video element status
      if (videoRef.current) {
        const video = videoRef.current;
        info.videoElementStatus = video.readyState >= 2 ? "Ready" : "Loading";
        info.isVideoPlaying =
          !video.paused && !video.ended && video.currentTime > 0;

        if (video.error) {
          info.videoElementError = video.error.message;
        }
      }

      // Get available cameras
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(
          (device) => device.kind === "videoinput",
        );
        setCameraDevices(cameras);
        info.camerasAvailable = cameras.length;
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }

      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, [stream, videoRef]);

  const forceVideoPlay = async () => {
    if (videoRef.current && stream) {
      try {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
      } catch (err) {
        console.error("Force play failed:", err);
      }
    }
  };

  const switchCamera = async () => {
    if (cameraDevices.length > 1) {
      try {
        // Try to get a different camera
        const constraints = {
          video: {
            deviceId: { exact: cameraDevices[1].deviceId },
          },
          audio: true,
        };
        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera switch failed:", err);
      }
    }
  };

  const getStatusBadge = (status: string, isGood: boolean) => (
    <Badge variant={isGood ? "default" : "destructive"}>
      {isGood ? (
        <CheckCircle className="w-3 h-3 mr-1" />
      ) : (
        <AlertTriangle className="w-3 h-3 mr-1" />
      )}
      {status}
    </Badge>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Camera Diagnostic Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold">{debugInfo.videoTracks}</div>
            <div className="text-sm text-gray-600">Video Tracks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{debugInfo.audioTracks}</div>
            <div className="text-sm text-gray-600">Audio Tracks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {debugInfo.camerasAvailable}
            </div>
            <div className="text-sm text-gray-600">Cameras Found</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {debugInfo.isVideoPlaying ? "▶️" : "⏸️"}
            </div>
            <div className="text-sm text-gray-600">Video Status</div>
          </div>
        </div>

        {/* Detailed Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Stream Status:</span>
            {getStatusBadge(
              debugInfo.streamStatus,
              debugInfo.streamStatus === "Active",
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Video Element:</span>
            {getStatusBadge(
              debugInfo.videoElementStatus,
              debugInfo.videoElementStatus === "Ready",
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Video Playing:</span>
            {getStatusBadge(
              debugInfo.isVideoPlaying ? "Yes" : "No",
              debugInfo.isVideoPlaying,
            )}
          </div>
        </div>

        {/* Video Settings */}
        {debugInfo.videoSettings && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Video Settings:</h4>
            <div className="text-sm space-y-1">
              <div>
                Resolution: {debugInfo.videoSettings.width} ×{" "}
                {debugInfo.videoSettings.height}
              </div>
              <div>Frame Rate: {debugInfo.videoSettings.frameRate} fps</div>
              <div>
                Device: {debugInfo.videoSettings.deviceId?.substring(0, 20)}...
              </div>
            </div>
          </div>
        )}

        {/* Available Cameras */}
        {cameraDevices.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Available Cameras:</h4>
            <div className="space-y-1">
              {cameraDevices.map((camera, index) => (
                <div key={camera.deviceId} className="text-sm">
                  {index + 1}. {camera.label || `Camera ${index + 1}`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {debugInfo.videoElementError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Video Error: {debugInfo.videoElementError}
            </AlertDescription>
          </Alert>
        )}

        {/* Common Issues and Solutions */}
        {(!stream ||
          debugInfo.videoTracks === 0 ||
          !debugInfo.isVideoPlaying) && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Possible Issues:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                {!stream && <li>• No camera stream detected</li>}
                {debugInfo.videoTracks === 0 && (
                  <li>• Camera track missing from stream</li>
                )}
                {debugInfo.camerasAvailable === 0 && (
                  <li>• No cameras found on this device</li>
                )}
                {!debugInfo.isVideoPlaying && (
                  <li>• Video element not playing</li>
                )}
                {debugInfo.streamStatus === "Inactive" && (
                  <li>• Camera stream is inactive</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={onRetry} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Restart Camera
          </Button>

          <Button variant="outline" onClick={forceVideoPlay}>
            <Camera className="w-4 h-4 mr-2" />
            Force Play
          </Button>

          {cameraDevices.length > 1 && (
            <Button variant="outline" onClick={switchCamera}>
              <Monitor className="w-4 h-4 mr-2" />
              Switch Camera
            </Button>
          )}
        </div>

        {/* Manual Fixes */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Manual Fixes to Try:</h4>
          <ol className="text-sm space-y-1">
            <li>1. Close other apps using your camera (Zoom, Teams, etc.)</li>
            <li>2. Refresh this page completely</li>
            <li>3. Try a different browser (Chrome works best)</li>
            <li>4. Check if your camera has a physical privacy cover</li>
            <li>5. Restart your browser</li>
            <li>6. Update your camera drivers</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
