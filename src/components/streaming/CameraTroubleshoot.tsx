import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Mic,
  CheckCircle,
  X,
  AlertTriangle,
  RefreshCw,
  Settings,
  Monitor,
  Smartphone,
} from "lucide-react";

interface CameraTroubleshootProps {
  onRetry: () => void;
  className?: string;
}

export const CameraTroubleshoot: React.FC<CameraTroubleshootProps> = ({
  onRetry,
  className,
}) => {
  const [diagnostics, setDiagnostics] = useState({
    browserSupport: false,
    httpsConnection: false,
    mediaDevicesAvailable: false,
    cameraDevices: [] as MediaDeviceInfo[],
    microphoneDevices: [] as MediaDeviceInfo[],
    permissions: "unknown" as "granted" | "denied" | "prompt" | "unknown",
  });
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);

    try {
      // Check browser support
      const browserSupport = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );

      // Check HTTPS connection
      const httpsConnection =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      // Check media devices availability
      let mediaDevicesAvailable = false;
      let cameraDevices: MediaDeviceInfo[] = [];
      let microphoneDevices: MediaDeviceInfo[] = [];

      if (browserSupport) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          cameraDevices = devices.filter(
            (device) => device.kind === "videoinput",
          );
          microphoneDevices = devices.filter(
            (device) => device.kind === "audioinput",
          );
          mediaDevicesAvailable =
            cameraDevices.length > 0 && microphoneDevices.length > 0;
        } catch (error) {
          console.error("Error enumerating devices:", error);
        }
      }

      // Check permissions
      let permissions: "granted" | "denied" | "prompt" | "unknown" = "unknown";
      if (navigator.permissions) {
        try {
          const cameraPermission = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          permissions = cameraPermission.state;
        } catch (error) {
          console.log("Permission API not available for camera");
        }
      }

      setDiagnostics({
        browserSupport,
        httpsConnection,
        mediaDevicesAvailable,
        cameraDevices,
        microphoneDevices,
        permissions,
      });
    } catch (error) {
      console.error("Diagnostics failed:", error);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-red-600" />
    );
  };

  const getPermissionStatus = () => {
    switch (diagnostics.permissions) {
      case "granted":
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          text: "Granted",
          color: "text-green-600",
        };
      case "denied":
        return {
          icon: <X className="w-4 h-4 text-red-600" />,
          text: "Denied",
          color: "text-red-600",
        };
      case "prompt":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
          text: "Not requested",
          color: "text-yellow-600",
        };
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-gray-400" />,
          text: "Unknown",
          color: "text-gray-400",
        };
    }
  };

  const permissionStatus = getPermissionStatus();
  const overallStatus =
    diagnostics.browserSupport &&
    diagnostics.httpsConnection &&
    diagnostics.mediaDevicesAvailable;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Camera Diagnostics
            {isRunningDiagnostics && (
              <RefreshCw className="w-4 h-4 animate-spin" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Status */}
          <Alert variant={overallStatus ? "default" : "destructive"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {overallStatus
                ? "Your system appears to be compatible with camera streaming."
                : "There are issues that need to be resolved before you can use the camera."}
            </AlertDescription>
          </Alert>

          {/* System Checks */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">System Requirements</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-4 h-4" />
                  <span>Browser Support</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostics.browserSupport)}
                  <span
                    className={
                      diagnostics.browserSupport
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {diagnostics.browserSupport ? "Supported" : "Not Supported"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span>🔒</span>
                  <span>Secure Connection (HTTPS)</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostics.httpsConnection)}
                  <span
                    className={
                      diagnostics.httpsConnection
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {diagnostics.httpsConnection ? "Secure" : "Insecure"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4" />
                  <span>Camera Available</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostics.cameraDevices.length > 0)}
                  <span
                    className={
                      diagnostics.cameraDevices.length > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {diagnostics.cameraDevices.length} device(s)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mic className="w-4 h-4" />
                  <span>Microphone Available</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostics.microphoneDevices.length > 0)}
                  <span
                    className={
                      diagnostics.microphoneDevices.length > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {diagnostics.microphoneDevices.length} device(s)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span>🔐</span>
                  <span>Camera Permission</span>
                </div>
                <div className="flex items-center gap-2">
                  {permissionStatus.icon}
                  <span className={permissionStatus.color}>
                    {permissionStatus.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Device Details */}
          {(diagnostics.cameraDevices.length > 0 ||
            diagnostics.microphoneDevices.length > 0) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Available Devices</h3>

              {diagnostics.cameraDevices.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Cameras:</h4>
                  <div className="space-y-1">
                    {diagnostics.cameraDevices.map((device, index) => (
                      <div
                        key={device.deviceId}
                        className="text-sm p-2 bg-gray-50 rounded"
                      >
                        📹 {device.label || `Camera ${index + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diagnostics.microphoneDevices.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Microphones:</h4>
                  <div className="space-y-1">
                    {diagnostics.microphoneDevices.map((device, index) => (
                      <div
                        key={device.deviceId}
                        className="text-sm p-2 bg-gray-50 rounded"
                      >
                        🎤 {device.label || `Microphone ${index + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Fixes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Fixes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={runDiagnostics}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Diagnostics Again
              </Button>
              <Button variant="outline" onClick={onRetry} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Try Camera Again
              </Button>
            </div>
          </div>

          {/* Mobile-specific tips */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile Tips
            </h3>
            <div className="text-sm space-y-1 text-gray-600">
              <p>• Allow camera access when prompted</p>
              <p>• Close other apps using the camera</p>
              <p>• Try refreshing the page</p>
              <p>• Check browser settings for camera permissions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
