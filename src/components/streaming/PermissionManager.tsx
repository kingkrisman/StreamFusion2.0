import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Mic,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  ExternalLink,
  Copy,
  Monitor,
  Chrome,
  Firefox,
  Globe,
} from "lucide-react";

interface PermissionManagerProps {
  onRetry: () => void;
  onPermissionGranted?: () => void;
}

interface PermissionStatus {
  camera: "granted" | "denied" | "prompt" | "unknown";
  microphone: "granted" | "denied" | "prompt" | "unknown";
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  onRetry,
  onPermissionGranted,
}) => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: "unknown",
    microphone: "unknown",
  });
  const [isChecking, setIsChecking] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({
    name: "Unknown",
    supportsPermissionAPI: false,
  });
  const [showManualSteps, setShowManualSteps] = useState(false);

  useEffect(() => {
    // Detect browser
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";

    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      browserName = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browserName = "Safari";
    } else if (userAgent.includes("Edg")) {
      browserName = "Edge";
    }

    setBrowserInfo({
      name: browserName,
      supportsPermissionAPI: !!navigator.permissions,
    });

    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setIsChecking(true);

    try {
      if (navigator.permissions) {
        try {
          const [cameraPermission, micPermission] = await Promise.all([
            navigator.permissions.query({ name: "camera" as PermissionName }),
            navigator.permissions.query({
              name: "microphone" as PermissionName,
            }),
          ]);

          setPermissions({
            camera: cameraPermission.state,
            microphone: micPermission.state,
          });

          // Listen for permission changes
          cameraPermission.onchange = () => {
            setPermissions((prev) => ({
              ...prev,
              camera: cameraPermission.state,
            }));
          };
          micPermission.onchange = () => {
            setPermissions((prev) => ({
              ...prev,
              microphone: micPermission.state,
            }));
          };
        } catch (err) {
          console.warn("Permission API not fully supported:", err);
          setPermissions({ camera: "unknown", microphone: "unknown" });
        }
      } else {
        setPermissions({ camera: "unknown", microphone: "unknown" });
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
    } finally {
      setIsChecking(false);
    }
  };

  const requestPermissions = async () => {
    setIsChecking(true);

    try {
      // Try to request permissions by attempting to get media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // If successful, stop the stream and update permissions
      stream.getTracks().forEach((track) => track.stop());
      await checkPermissions();

      if (onPermissionGranted) {
        onPermissionGranted();
      }
    } catch (err) {
      console.error("Permission request failed:", err);
      await checkPermissions();
    } finally {
      setIsChecking(false);
    }
  };

  const resetPermissions = () => {
    // Instructions for resetting permissions in different browsers
    setShowManualSteps(true);
  };

  const openBrowserSettings = () => {
    if (browserInfo.name === "Chrome") {
      window.open("chrome://settings/content/camera", "_blank");
    } else if (browserInfo.name === "Firefox") {
      window.open("about:preferences#privacy", "_blank");
    } else {
      // Generic fallback
      alert(
        "Please open your browser settings and look for camera/microphone permissions.",
      );
    }
  };

  const copyCurrentURL = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("URL copied! You can paste this in a new browser tab.");
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const getPermissionIcon = (status: string) => {
    switch (status) {
      case "granted":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "denied":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "prompt":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPermissionBadge = (status: string) => {
    switch (status) {
      case "granted":
        return <Badge className="bg-green-100 text-green-800">Allowed</Badge>;
      case "denied":
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>;
      case "prompt":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Not Asked</Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const allPermissionsGranted =
    permissions.camera === "granted" && permissions.microphone === "granted";
  const anyPermissionDenied =
    permissions.camera === "denied" || permissions.microphone === "denied";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permission Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getPermissionIcon(permissions.camera)}
                <Camera className="w-4 h-4" />
                <span className="font-medium">Camera</span>
              </div>
              {getPermissionBadge(permissions.camera)}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getPermissionIcon(permissions.microphone)}
                <Mic className="w-4 h-4" />
                <span className="font-medium">Microphone</span>
              </div>
              {getPermissionBadge(permissions.microphone)}
            </div>
          </div>

          {/* Browser Info */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                Browser: {browserInfo.name}
              </span>
            </div>
            <div className="text-sm text-blue-700">
              Permission API:{" "}
              {browserInfo.supportsPermissionAPI ? "Supported" : "Limited"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!allPermissionsGranted && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={requestPermissions}
                  disabled={isChecking}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isChecking ? "Requesting..." : "Grant Permissions"}
                </Button>

                <Button
                  variant="outline"
                  onClick={checkPermissions}
                  disabled={isChecking}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Status
                </Button>
              </div>
            )}

            {anyPermissionDenied && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" onClick={resetPermissions}>
                  <Settings className="w-4 h-4 mr-2" />
                  Reset Permissions
                </Button>

                <Button variant="outline" onClick={openBrowserSettings}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Browser Settings
                </Button>
              </div>
            )}

            {allPermissionsGranted && (
              <Button onClick={onRetry} className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Continue with Camera Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Reset Instructions */}
      {showManualSteps && (
        <Card>
          <CardHeader>
            <CardTitle>Reset Camera Permissions Manually</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {browserInfo.name === "Chrome" && (
              <div className="space-y-3">
                <h4 className="font-semibold">Chrome Instructions:</h4>
                <ol className="space-y-2 text-sm">
                  <li>1. Click the camera icon in the address bar (🎥)</li>
                  <li>
                    2. Select "Always allow {window.location.hostname} to access
                    camera and microphone"
                  </li>
                  <li>3. Click "Done" and refresh this page</li>
                  <li>
                    4. If no camera icon, go to chrome://settings/content/camera
                  </li>
                </ol>
              </div>
            )}

            {browserInfo.name === "Firefox" && (
              <div className="space-y-3">
                <h4 className="font-semibold">Firefox Instructions:</h4>
                <ol className="space-y-2 text-sm">
                  <li>1. Click the shield icon in the address bar</li>
                  <li>2. Click "Allow Camera and Microphone"</li>
                  <li>3. Or go to about:preferences#privacy</li>
                  <li>
                    4. Find this website under Permissions and change settings
                  </li>
                </ol>
              </div>
            )}

            {browserInfo.name === "Safari" && (
              <div className="space-y-3">
                <h4 className="font-semibold">Safari Instructions:</h4>
                <ol className="space-y-2 text-sm">
                  <li>1. Go to Safari → Settings → Websites</li>
                  <li>2. Click "Camera" in the left sidebar</li>
                  <li>3. Find this website and change to "Allow"</li>
                  <li>4. Do the same for "Microphone"</li>
                </ol>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t">
              <Button
                variant="outline"
                onClick={copyCurrentURL}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Page URL
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Why do we need these permissions?</strong> Camera and
          microphone access is required for live streaming. Your data is
          processed locally and only shared when you explicitly start streaming
          to selected platforms.
        </AlertDescription>
      </Alert>
    </div>
  );
};
