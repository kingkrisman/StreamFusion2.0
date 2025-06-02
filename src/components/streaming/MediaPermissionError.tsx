import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CameraTroubleshoot } from "./CameraTroubleshoot";
import {
  AlertTriangle,
  Camera,
  Mic,
  Shield,
  Monitor,
  RefreshCw,
  Info,
  CheckCircle,
  Wrench,
  ExternalLink,
  Copy,
  HelpCircle,
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
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<{
    name: string;
    version: string;
    isSupported: boolean;
  }>({ name: "Unknown", version: "", isSupported: true });

  useEffect(() => {
    // Detect browser for specific instructions
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let version = "";
    let isSupported = true;

    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      browserName = "Chrome";
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : "";
      isSupported = parseInt(version) >= 60;
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox";
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : "";
      isSupported = parseInt(version) >= 60;
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browserName = "Safari";
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : "";
      isSupported = parseInt(version) >= 11;
    } else if (userAgent.includes("Edg")) {
      browserName = "Edge";
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : "";
      isSupported = parseInt(version) >= 79;
    }

    setBrowserInfo({ name: browserName, version, isSupported });
  }, []);

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

  const copyCurrentUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

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

      {/* Current browser status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Your Browser: {browserInfo.name} {browserInfo.version}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            {browserInfo.isSupported ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">
                  Your browser supports camera streaming
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">
                  Your browser version may not fully support camera streaming
                </span>
              </>
            )}
          </div>

          {!browserInfo.isSupported && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please update your browser to the latest version for the best
                experience.
              </AlertDescription>
            </Alert>
          )}

          {window.location.protocol !== "https:" &&
            window.location.hostname !== "localhost" && (
              <Alert variant="destructive" className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Camera access requires HTTPS. Try accessing:{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={copyCurrentUrl}
                  >
                    https://{window.location.hostname}
                    {window.location.pathname}
                    {copiedUrl ? (
                      <CheckCircle className="w-3 h-3 ml-1 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>

      {/* Browser-specific instructions */}
      {errorDetails.type === "permission" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Step-by-Step Fix for {browserInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {browserInfo.name === "Chrome" && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    1
                  </Badge>
                  <div>
                    <p className="font-medium">
                      Click the camera icon in the address bar
                    </p>
                    <p className="text-sm text-gray-600">
                      Look for a camera/microphone icon to the left of the
                      bookmark star
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    2
                  </Badge>
                  <div>
                    <p className="font-medium">
                      Select "Allow" for both camera and microphone
                    </p>
                    <p className="text-sm text-gray-600">
                      Choose "Always allow on this site" for future visits
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    3
                  </Badge>
                  <div>
                    <p className="font-medium">Click "Done" and try again</p>
                    <p className="text-sm text-gray-600">
                      The page should reload and camera access should work
                    </p>
                  </div>
                </div>
              </div>
            )}

            {browserInfo.name === "Firefox" && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    1
                  </Badge>
                  <div>
                    <p className="font-medium">
                      Look for the permission notification
                    </p>
                    <p className="text-sm text-gray-600">
                      Firefox shows a permission bar at the top of the page
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    2
                  </Badge>
                  <div>
                    <p className="font-medium">
                      Click "Allow" for camera and microphone
                    </p>
                    <p className="text-sm text-gray-600">
                      You can also click the shield icon in the address bar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    3
                  </Badge>
                  <div>
                    <p className="font-medium">Refresh the page if needed</p>
                    <p className="text-sm text-gray-600">
                      Sometimes Firefox requires a page refresh
                    </p>
                  </div>
                </div>
              </div>
            )}

            {browserInfo.name === "Safari" && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    1
                  </Badge>
                  <div>
                    <p className="font-medium">Check the Safari menu</p>
                    <p className="text-sm text-gray-600">
                      Go to Safari → Settings → Websites
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    2
                  </Badge>
                  <div>
                    <p className="font-medium">
                      Find Camera and Microphone settings
                    </p>
                    <p className="text-sm text-gray-600">
                      Look for this website in the list
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    3
                  </Badge>
                  <div>
                    <p className="font-medium">Set permissions to "Allow"</p>
                    <p className="text-sm text-gray-600">
                      Then refresh this page
                    </p>
                  </div>
                </div>
              </div>
            )}

            {browserInfo.name === "Edge" && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    1
                  </Badge>
                  <div>
                    <p className="font-medium">
                      Click the camera icon in the address bar
                    </p>
                    <p className="text-sm text-gray-600">
                      Similar to Chrome, look for permissions icon
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    2
                  </Badge>
                  <div>
                    <p className="font-medium">
                      Allow camera and microphone access
                    </p>
                    <p className="text-sm text-gray-600">
                      Select "Allow" for both devices
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    3
                  </Badge>
                  <div>
                    <p className="font-medium">Try again</p>
                    <p className="text-sm text-gray-600">
                      The camera should now be accessible
                    </p>
                  </div>
                </div>
              </div>
            )}

            {browserInfo.name === "Unknown" && (
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
            )}
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

      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="diagnostics">
            <Wrench className="w-4 h-4 mr-2" />
            Diagnostics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>

          {/* Additional help resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="w-5 h-5" />
                Still Having Issues?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() =>
                    window.open(
                      "https://support.google.com/chrome/answer/2693767",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Chrome Help
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() =>
                    window.open(
                      "https://support.mozilla.org/kb/how-manage-your-camera-and-microphone-permissions",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Firefox Help
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() =>
                    window.open(
                      "https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Safari Help
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() =>
                    window.open(
                      "https://support.microsoft.com/topic/camera-doesn-t-work-in-windows-32adb016-b29c-a928-0073-53d31da0dad5",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Windows Help
                </Button>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Common solutions that work:
                </p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>
                    • Close other apps using your camera (Zoom, Teams, Skype)
                  </li>
                  <li>• Restart your browser completely</li>
                  <li>• Try a different browser (Chrome usually works best)</li>
                  <li>• Check if your antivirus is blocking camera access</li>
                  <li>• Make sure your camera drivers are up to date</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics">
          <CameraTroubleshoot onRetry={onRetry} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
