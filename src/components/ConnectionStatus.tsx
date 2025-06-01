import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  WifiOff,
  Server,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  className?: string;
}

interface ServiceStatus {
  name: string;
  status: "connected" | "disconnected" | "demo";
  description: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Streaming",
      status: "demo",
      description: "RTMP streaming service",
    },
    {
      name: "Signaling",
      status: "demo",
      description: "WebRTC guest connections",
    },
    { name: "Chat", status: "demo", description: "Live chat integration" },
  ]);

  useEffect(() => {
    // Check if we're likely in demo mode
    const isDemoMode =
      !import.meta.env.VITE_YOUTUBE_CLIENT_ID ||
      import.meta.env.VITE_YOUTUBE_CLIENT_ID === "your-youtube-client-id";

    if (isDemoMode) {
      // Show demo status initially, then hide after a few seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, []);

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "disconnected":
        return <WifiOff className="w-4 h-4 text-red-600" />;
      case "demo":
        return <Server className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200";
      case "disconnected":
        return "bg-red-100 text-red-800 border-red-200";
      case "demo":
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const allDemo = services.every((s) => s.status === "demo");
  const hasDisconnected = services.some((s) => s.status === "disconnected");

  if (!isVisible && allDemo) return null;

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <Card className="w-80 shadow-lg border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Service Status</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="text-sm font-medium">{service.name}</div>
                    <div className="text-xs text-gray-500">
                      {service.description}
                    </div>
                  </div>
                </div>
                <Badge
                  className={cn("text-xs", getStatusColor(service.status))}
                >
                  {service.status === "demo"
                    ? "Demo"
                    : service.status === "connected"
                      ? "Live"
                      : "Offline"}
                </Badge>
              </div>
            ))}
          </div>

          {allDemo && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Demo Mode Active</p>
                  <p>
                    All features are simulated. Configure backend services for
                    live streaming.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasDisconnected && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
