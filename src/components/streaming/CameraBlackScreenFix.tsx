import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  RefreshCw,
  Monitor,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

interface CameraBlackScreenFixProps {
  onRetry: () => void;
  onOpenSettings?: () => void;
}

export const CameraBlackScreenFix: React.FC<CameraBlackScreenFixProps> = ({
  onRetry,
  onOpenSettings,
}) => {
  const quickFixes = [
    {
      title: "Close Other Apps",
      description: "Close Zoom, Teams, Skype, or any other video apps",
      action: "Check your taskbar and close video calling apps",
      priority: "high",
    },
    {
      title: "Check Privacy Cover",
      description: "Many cameras have a physical privacy slider or cover",
      action: "Look for a slider or cover over your camera lens",
      priority: "high",
    },
    {
      title: "Try Different Browser",
      description: "Chrome usually has the best camera support",
      action: "Open this page in Google Chrome",
      priority: "medium",
    },
    {
      title: "Restart Browser",
      description: "Sometimes browsers need a fresh start",
      action: "Close all browser windows and restart",
      priority: "medium",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Camera className="h-4 w-4" />
        <AlertDescription>
          <strong>Black Camera Screen?</strong> This usually happens when
          another app is using your camera or there's a physical privacy cover.
          Try these quick fixes:
        </AlertDescription>
      </Alert>

      <div className="grid gap-3">
        {quickFixes.map((fix, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <Badge className={getPriorityColor(fix.priority)}>
                {index + 1}
              </Badge>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{fix.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{fix.description}</p>
                <p className="text-sm font-medium text-blue-700">
                  {fix.action}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5" />
            Quick Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            After trying the steps above, test your camera:
          </p>

          <div className="flex gap-3">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Test Camera Again
            </Button>

            {onOpenSettings && (
              <Button variant="outline" onClick={onOpenSettings}>
                <Monitor className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t">
            <strong>Still not working?</strong> Try visiting{" "}
            <a
              href="https://webcamtests.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              webcamtests.com
            </a>{" "}
            to test if your camera works in other websites.
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-1">Success Tip</h4>
              <p className="text-sm text-green-700">
                Most black camera issues are solved by closing other video apps
                like Zoom or Teams. Check your taskbar for any video calling
                applications and close them completely.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
