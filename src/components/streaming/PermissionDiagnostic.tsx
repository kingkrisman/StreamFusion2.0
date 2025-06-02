import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Mic,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Monitor,
} from "lucide-react";

interface PermissionDiagnosticProps {
  onRetry: () => void;
}

export const PermissionDiagnostic: React.FC<PermissionDiagnosticProps> = ({
  onRetry,
}) => {
  const [diagnostics, setDiagnostics] = useState({
    mediaDevicesSupported: false,
    secureContext: false,
    permissionAPISupported: false,
    cameraPermission: "unknown",
    micPermission: "unknown",
    devicesFound: 0,
    browserInfo: "",
  });

  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);

    const results = {
      mediaDevicesSupported: !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ),
      secureContext:
        window.isSecureContext || window.location.hostname === "localhost",
      permissionAPISupported: !!navigator.permissions,
      cameraPermission: "unknown",
      micPermission: "unknown",
      devicesFound: 0,
      browserInfo: navigator.userAgent.includes("Chrome")
        ? "Chrome"
        : navigator.userAgent.includes("Firefox")
          ? "Firefox"
          : navigator.userAgent.includes("Safari")
            ? "Safari"
            : navigator.userAgent.includes("Edge")
              ? "Edge"
              : "Unknown",
    };

    // Check permissions if API is available
    if (navigator.permissions) {
      try {
        const [cameraPermission, micPermission] = await Promise.all([
          navigator.permissions.query({ name: "camera" as PermissionName }),
          navigator.permissions.query({ name: "microphone" as PermissionName }),
        ]);
        results.cameraPermission = cameraPermission.state;
        results.micPermission = micPermission.state;
      } catch (err) {
        console.warn("Permission query failed:", err);
      }
    }

    // Count available devices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        results.devicesFound = devices.filter(
          (d) => d.kind === "videoinput",
        ).length;
      } catch (err) {
        console.warn("Device enumeration failed:", err);
      }
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === "boolean") {
      return status ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600" />
      );
    }

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

  const getStatusText = (status: boolean | string) => {
    if (typeof status === "boolean") {
      return status ? "✓ Supported" : "✗ Not Supported";
    }

    switch (status) {
      case "granted":
        return "✓ Allowed";
      case "denied":
        return "✗ Blocked";
      case "prompt":
        return "? Not Asked";
      default:
        return "? Unknown";
    }
  };

  const allGood =
    diagnostics.mediaDevicesSupported &&
    diagnostics.secureContext &&
    diagnostics.cameraPermission === "granted" &&
    diagnostics.devicesFound > 0;

  const hasIssues =
    !diagnostics.mediaDevicesSupported ||
    !diagnostics.secureContext ||
    diagnostics.cameraPermission === "denied" ||
    diagnostics.devicesFound === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Camera Permission Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              {getStatusIcon(diagnostics.mediaDevicesSupported)}
              <span className="font-medium">Media Devices API</span>
            </div>
            <Badge
              variant={
                diagnostics.mediaDevicesSupported ? "default" : "destructive"
              }
            >
              {getStatusText(diagnostics.mediaDevicesSupported)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              {getStatusIcon(diagnostics.secureContext)}
              <span className="font-medium">Secure Context (HTTPS)</span>
            </div>
            <Badge
              variant={diagnostics.secureContext ? "default" : "destructive"}
            >
              {getStatusText(diagnostics.secureContext)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              {getStatusIcon(diagnostics.cameraPermission)}
              <Camera className="w-4 h-4" />
              <span className="font-medium">Camera Permission</span>
            </div>
            <Badge
              variant={
                diagnostics.cameraPermission === "granted"
                  ? "default"
                  : diagnostics.cameraPermission === "denied"
                    ? "destructive"
                    : "secondary"
              }
            >
              {getStatusText(diagnostics.cameraPermission)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              {getStatusIcon(diagnostics.micPermission)}
              <Mic className="w-4 h-4" />
              <span className="font-medium">Microphone Permission</span>
            </div>
            <Badge
              variant={
                diagnostics.micPermission === "granted"
                  ? "default"
                  : diagnostics.micPermission === "denied"
                    ? "destructive"
                    : "secondary"
              }
            >
              {getStatusText(diagnostics.micPermission)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              {getStatusIcon(diagnostics.devicesFound > 0)}
              <span className="font-medium">Cameras Found</span>
            </div>
            <Badge
              variant={diagnostics.devicesFound > 0 ? "default" : "destructive"}
            >
              {diagnostics.devicesFound} device
              {diagnostics.devicesFound !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4" />
              <span className="font-medium">Browser</span>
            </div>
            <Badge variant="outline">{diagnostics.browserInfo}</Badge>
          </div>
        </div>

        {/* Overall Status */}
        <div
          className={`p-4 rounded-lg ${
            allGood
              ? "bg-green-50 border border-green-200"
              : hasIssues
                ? "bg-red-50 border border-red-200"
                : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {allGood ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : hasIssues ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <p
                className={`font-semibold ${
                  allGood
                    ? "text-green-800"
                    : hasIssues
                      ? "text-red-800"
                      : "text-yellow-800"
                }`}
              >
                {allGood
                  ? "All systems ready!"
                  : hasIssues
                    ? "Issues detected"
                    : "Some permissions needed"}
              </p>
              <p
                className={`text-sm ${
                  allGood
                    ? "text-green-700"
                    : hasIssues
                      ? "text-red-700"
                      : "text-yellow-700"
                }`}
              >
                {allGood
                  ? "Your camera should work perfectly"
                  : hasIssues
                    ? "Fix the issues above to use your camera"
                    : "Grant permissions to continue"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRunning ? "animate-spin" : ""}`}
            />
            {isRunning ? "Scanning..." : "Run Diagnostics"}
          </Button>

          {(allGood ||
            (!hasIssues && diagnostics.cameraPermission !== "denied")) && (
            <Button onClick={onRetry} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Try Camera Now
            </Button>
          )}
        </div>

        {/* Specific Recommendations */}
        {hasIssues && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Recommendations:</h4>
            <ul className="text-sm space-y-1">
              {!diagnostics.secureContext && (
                <li>• Access this site via HTTPS (not HTTP)</li>
              )}
              {!diagnostics.mediaDevicesSupported && (
                <li>• Update your browser to the latest version</li>
              )}
              {diagnostics.cameraPermission === "denied" && (
                <li>• Reset camera permissions in browser settings</li>
              )}
              {diagnostics.devicesFound === 0 && (
                <li>
                  • Check that your camera is connected and not used by other
                  apps
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
