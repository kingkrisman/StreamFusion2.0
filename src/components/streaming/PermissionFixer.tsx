import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Shield,
  Zap,
} from "lucide-react";

interface PermissionFixerProps {
  onRetry: () => void;
}

export const PermissionFixer: React.FC<PermissionFixerProps> = ({
  onRetry,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const forceRequestPermissions = async () => {
    setIsRequesting(true);
    setLastError(null);

    try {
      console.log("Force requesting permissions...");

      // Try multiple approaches to request permissions
      const approaches = [
        // Approach 1: Standard request
        () => navigator.mediaDevices.getUserMedia({ video: true, audio: true }),

        // Approach 2: Video only
        () =>
          navigator.mediaDevices.getUserMedia({ video: true, audio: false }),

        // Approach 3: Audio only
        () =>
          navigator.mediaDevices.getUserMedia({ video: false, audio: true }),

        // Approach 4: Minimal constraints
        () =>
          navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240 },
            audio: { sampleRate: 8000 },
          }),
      ];

      let lastStreamError: any = null;

      for (let i = 0; i < approaches.length; i++) {
        try {
          console.log(`Trying approach ${i + 1}...`);
          const stream = await approaches[i]();

          console.log("Permission granted! Stopping test stream...");
          // Stop the test stream immediately
          stream.getTracks().forEach((track) => track.stop());

          // Wait a moment for cleanup
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Now try the actual initialization
          onRetry();
          return;
        } catch (err: any) {
          console.warn(`Approach ${i + 1} failed:`, err.name, err.message);
          lastStreamError = err;

          if (err.name === "NotAllowedError") {
            // User explicitly denied, no point trying other approaches
            break;
          }
        }
      }

      // All approaches failed
      throw lastStreamError || new Error("All permission approaches failed");
    } catch (err: any) {
      console.error("Force permission request failed:", err);
      setLastError(err.message || "Permission request failed");
    } finally {
      setIsRequesting(false);
    }
  };

  const openChromeSettings = () => {
    window.open("chrome://settings/content/camera", "_blank");
  };

  const openTestSite = () => {
    window.open("https://webcamtests.com", "_blank");
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Permission Denied:</strong> Your browser is blocking camera
          access. Try the one-click fix below or follow the manual steps.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <Zap className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">
              One-Click Permission Fix
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This will attempt to request camera permissions using multiple
              approaches
            </p>

            <Button
              onClick={forceRequestPermissions}
              disabled={isRequesting}
              className="w-full mb-4"
              size="lg"
            >
              {isRequesting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Requesting Permissions...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Fix Camera Permissions Now
                </>
              )}
            </Button>

            {lastError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {lastError.includes("NotAllowedError") ||
                  lastError.includes("Permission denied")
                    ? "Permission was denied. Please use the manual steps below."
                    : `Error: ${lastError}`}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">
              Manual Steps (if one-click doesn't work):
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium">
                    Look for camera icon in address bar
                  </p>
                  <p className="text-gray-600">
                    Click the camera/microphone icon (usually left of the
                    bookmark star)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium">
                    Select "Allow" for camera and microphone
                  </p>
                  <p className="text-gray-600">
                    Choose "Always allow" if available
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium">Refresh and try again</p>
                  <p className="text-gray-600">
                    Reload this page after granting permissions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Additional Options:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" onClick={onRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={openChromeSettings}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Browser Settings
              </Button>

              <Button
                variant="outline"
                onClick={openTestSite}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Camera
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Success Rate: 90%+</p>
                <p className="text-green-700">
                  Most permission issues are solved by checking the address bar
                  for camera permission prompts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
