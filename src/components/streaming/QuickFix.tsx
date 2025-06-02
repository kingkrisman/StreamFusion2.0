import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Shield,
} from "lucide-react";

interface QuickFixProps {
  onRetry: () => void;
}

export const QuickFix: React.FC<QuickFixProps> = ({ onRetry }) => {
  const isHTTPS =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost";

  const quickChecks = [
    {
      id: "https",
      label: "Secure Connection",
      status: isHTTPS ? "good" : "bad",
      description: isHTTPS ? "Site is using HTTPS" : "Camera requires HTTPS",
    },
    {
      id: "browser",
      label: "Browser Support",
      status: navigator.mediaDevices ? "good" : "bad",
      description: navigator.mediaDevices
        ? "Browser supports camera"
        : "Browser doesn't support camera",
    },
  ];

  const getStatusIcon = (status: string) => {
    return status === "good" ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Camera className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick Fix:</strong> Camera permission was denied. Here's how
          to fix it in 30 seconds:
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            {quickChecks.map((check) => (
              <div key={check.id} className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <span className="font-medium">{check.label}</span>
                <Badge
                  variant={check.status === "good" ? "default" : "destructive"}
                >
                  {check.description}
                </Badge>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Quick Steps:</h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Look for the camera icon</p>
                  <p className="text-sm text-gray-600">
                    Find it in your browser's address bar (usually near the
                    bookmark star)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Click "Allow"</p>
                  <p className="text-sm text-gray-600">
                    Select "Allow" or "Always allow" for both camera and
                    microphone
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Try again</p>
                  <p className="text-sm text-gray-600">
                    Click the button below to test your camera again
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex gap-3">
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Camera Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </div>

          {!isHTTPS && (
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your site is not using HTTPS. Camera access requires a secure
                connection. Try accessing the site with "https://" in the URL.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
