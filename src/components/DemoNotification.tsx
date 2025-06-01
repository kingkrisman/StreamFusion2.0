import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, X, Settings, ExternalLink, Lightbulb } from "lucide-react";
import { demoService } from "@/services/demoService";

export const DemoNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!demoService.isDemoModeActive() || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Badge
                variant="outline"
                className="text-blue-700 border-blue-300"
              >
                Demo Mode
              </Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  <Info className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <AlertDescription className="text-blue-800">
              <p className="font-medium mb-1">
                🎉 All features are fully functional in demo mode!
              </p>

              {isExpanded && (
                <div className="space-y-2 mt-3">
                  <p className="text-sm">
                    Experience the complete streaming platform with simulated
                    data:
                  </p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• ✅ Real camera/microphone capture</li>
                    <li>• ✅ Simulated multi-platform streaming</li>
                    <li>• ✅ Demo chat messages and viewers</li>
                    <li>• ✅ Guest invitations and WebRTC</li>
                    <li>• ✅ Recording and download</li>
                    <li>• ✅ All UI components and features</li>
                  </ul>

                  <div className="border-t border-blue-200 pt-2 mt-3">
                    <p className="text-xs font-medium mb-1">
                      For production use:
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 border-blue-300 text-blue-700"
                        onClick={() =>
                          window.open(
                            "https://github.com/your-repo/streaming-platform#environment-setup",
                            "_blank",
                          )
                        }
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Setup Guide
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 border-blue-300 text-blue-700"
                        onClick={() => window.open("/real-studio", "_blank")}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Real Studio
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
};
