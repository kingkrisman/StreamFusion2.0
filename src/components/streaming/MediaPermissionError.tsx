import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Camera,
  Mic,
  Shield,
  Monitor,
  RefreshCw,
  Info,
  CheckCircle,
} from "lucide-react";

interface MediaErrorDetails {
  type: "permission" | "hardware" | "security" | "browser" | "unknown";
  message: string;
  instructions: string[];
}

interface MediaPermissionErrorProps {
  error: string | null;
  onRetry: () => void;
  permissionState?: "prompt" | "granted" | "denied";
}

export const MediaPermissionError: React.FC<MediaPermissionErrorProps> = ({
  error,
  onRetry,
  permissionState,
}) => {
  if (!error) return null;

  let errorDetails: MediaErrorDetails;
  try {
    errorDetails = JSON.parse(error);
  } catch {
    errorDetails = {
      type: "unknown",
      message: error,
      instructions: ["Try refreshing the page and allowing camera access"],
    };
  }

  const getIcon = () => {
    switch (errorDetails.type) {
      case "permission":
        return <Shield className="w-6 h-6 text-orange-600" />;
      case "hardware":
        return <Camera className="w-6 h-6 text-red-600" />;
      case "security":
        return <Shield className="w-6 h-6 text-yellow-600" />;
      case "browser":
        return <Monitor className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
    }
  };

  const getAlertVariant = () => {
    switch (errorDetails.type) {
      case "permission":
        return "default";
      case "security":
        return "default";
      default:
        return "destructive";
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant={getAlertVariant()}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <AlertTitle className="text-lg font-semibold">
              {errorDetails.type === "permission" && "Camera Access Required"}
              {errorDetails.type === "hardware" && "Camera Not Available"}
              {errorDetails.type === "security" && "Security Issue"}
              {errorDetails.type === "browser" && "Browser Not Supported"}
              {errorDetails.type === "unknown" && "Camera Access Failed"}
            </AlertTitle>
            <AlertDescription className="mt-2">
              {errorDetails.message}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            How to Fix This
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {errorDetails.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                  {index + 1}
                </div>
                <span className="flex-1">{instruction}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Browser-specific instructions */}
      {errorDetails.type === "permission" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Browser-Specific Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Chrome / Edge</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Click the camera icon in the address bar</li>
                  <li>• Select "Always allow" for this site</li>
                  <li>• Refresh the page</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Firefox</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Click the shield icon in the address bar</li>
                  <li>• Enable camera and microphone</li>
                  <li>• Refresh the page</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Safari</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Go to Safari → Settings → Websites</li>
                  <li>• Select Camera and Microphone</li>
                  <li>• Allow for this website</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Mobile</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Check browser permissions in settings</li>
                  <li>• Allow camera and microphone access</li>
                  <li>• Restart the browser</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission status indicator */}
      {permissionState && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Camera:</span>
              </div>
              <div className="flex items-center gap-2">
                {permissionState === "granted" ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Allowed</span>
                  </>
                ) : permissionState === "denied" ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">Blocked</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">
                      Waiting for permission
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={onRetry} className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );
};
