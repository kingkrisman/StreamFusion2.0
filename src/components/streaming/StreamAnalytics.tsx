import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MessageCircle,
  Heart,
  Share,
  Users,
  Clock,
  Wifi,
  Signal,
} from "lucide-react";

interface StreamAnalyticsProps {
  viewerCount: number;
  peakViewers: number;
  chatMessages: number;
  likes: number;
  shares: number;
  duration: number;
  bandwidth: number;
  quality: string;
  className?: string;
}

export const StreamAnalytics: React.FC<StreamAnalyticsProps> = ({
  viewerCount,
  peakViewers,
  chatMessages,
  likes,
  shares,
  duration,
  bandwidth,
  quality,
  className,
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatBandwidth = (kbps: number) => {
    if (kbps > 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps} Kbps`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "HD":
        return "bg-green-100 text-green-800";
      case "FHD":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = [
    {
      label: "Current Viewers",
      value: viewerCount.toLocaleString(),
      icon: Eye,
      trend: viewerCount > peakViewers * 0.8 ? "up" : "down",
      color: "text-blue-600",
    },
    {
      label: "Peak Viewers",
      value: peakViewers.toLocaleString(),
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Chat Messages",
      value: chatMessages.toLocaleString(),
      icon: MessageCircle,
      color: "text-purple-600",
    },
    {
      label: "Likes",
      value: likes.toLocaleString(),
      icon: Heart,
      color: "text-red-600",
    },
    {
      label: "Shares",
      value: shares.toLocaleString(),
      icon: Share,
      color: "text-orange-600",
    },
    {
      label: "Duration",
      value: formatDuration(duration),
      icon: Clock,
      color: "text-indigo-600",
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Live Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.trend &&
                  (stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  ))}
              </div>
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Stream Quality */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Stream Quality</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Signal className="w-4 h-4 text-green-600" />
              <span className="text-sm">Resolution</span>
            </div>
            <Badge className={getQualityColor(quality)}>
              {quality === "FHD" ? "1080p" : "720p"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Bandwidth</span>
            </div>
            <span className="text-sm font-medium">
              {formatBandwidth(bandwidth)}
            </span>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Engagement</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm">Chat Activity</span>
            <Badge variant="outline">
              {viewerCount > 0
                ? Math.round((chatMessages / viewerCount) * 100)
                : 0}
              % active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
