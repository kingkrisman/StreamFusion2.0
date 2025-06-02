import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Trophy,
  Heart,
  Zap,
  Star,
  Crown,
  Gamepad2,
  Music,
} from "lucide-react";
import { StreamOverlay } from "@/types/streaming";

interface OverlayPresetsProps {
  onAddOverlay: (overlay: Omit<StreamOverlay, "id">) => void;
  className?: string;
}

export const OverlayPresets: React.FC<OverlayPresetsProps> = ({
  onAddOverlay,
  className,
}) => {
  const presets = [
    {
      name: "Welcome Text",
      icon: <Sparkles className="w-4 h-4" />,
      overlay: {
        type: "text" as const,
        content: "Welcome to the Stream!",
        position: { x: 50, y: 10 },
        size: { width: 400, height: 50 },
        visible: true,
        textStyle: {
          fontSize: 32,
          color: "#FFD700",
          fontWeight: "bold",
          textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
        },
      },
    },
    {
      name: "Subscribe Reminder",
      icon: <Heart className="w-4 h-4" />,
      overlay: {
        type: "text" as const,
        content: "Don't forget to subscribe!",
        position: { x: 5, y: 85 },
        size: { width: 300, height: 40 },
        visible: true,
        textStyle: {
          fontSize: 24,
          color: "#FF6B6B",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
        },
      },
    },
    {
      name: "Now Playing",
      icon: <Music className="w-4 h-4" />,
      overlay: {
        type: "text" as const,
        content: "♪ Now Playing: Your Favorite Song",
        position: { x: 5, y: 5 },
        size: { width: 350, height: 30 },
        visible: true,
        textStyle: {
          fontSize: 20,
          color: "#9B59B6",
          fontWeight: "normal",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
        },
      },
    },
    {
      name: "Gaming HUD",
      icon: <Gamepad2 className="w-4 h-4" />,
      overlay: {
        type: "text" as const,
        content: "Level 42 | HP: 100/100",
        position: { x: 75, y: 5 },
        size: { width: 200, height: 30 },
        visible: true,
        textStyle: {
          fontSize: 18,
          color: "#00FF00",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
        },
      },
    },
    {
      name: "Live Indicator",
      icon: <Zap className="w-4 h-4" />,
      overlay: {
        type: "text" as const,
        content: "🔴 LIVE",
        position: { x: 85, y: 5 },
        size: { width: 100, height: 40 },
        visible: true,
        textStyle: {
          fontSize: 28,
          color: "#FF0000",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
        },
      },
    },
    {
      name: "Follow Goal",
      icon: <Trophy className="w-4 h-4" />,
      overlay: {
        type: "text" as const,
        content: "Followers: 150/200 🎯",
        position: { x: 5, y: 15 },
        size: { width: 250, height: 30 },
        visible: true,
        textStyle: {
          fontSize: 20,
          color: "#F39C12",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
        },
      },
    },
    {
      name: "Thank You",
      icon: <Star className="w-4 h-4" />,
      overlay: {
        type: "text" as const,
        content: "Thanks for watching! ⭐",
        position: { x: 50, y: 50 },
        size: { width: 350, height: 40 },
        visible: true,
        textStyle: {
          fontSize: 26,
          color: "#FFD700",
          fontWeight: "bold",
          textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
        },
      },
    },
    {
      name: "VIP Badge",
      icon: <Crown className="w-4 h-4" />,
      overlay: {
        type: "text" as const,
        content: "👑 VIP Stream",
        position: { x: 75, y: 85 },
        size: { width: 150, height: 35 },
        visible: true,
        textStyle: {
          fontSize: 22,
          color: "#FFD700",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
        },
      },
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Quick Overlay Presets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {presets.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto p-3"
              onClick={() => onAddOverlay(preset.overlay)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-primary/10 rounded">{preset.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.overlay.content.substring(0, 30)}
                    {preset.overlay.content.length > 30 ? "..." : ""}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Pro Tip</span>
          </div>
          <p className="text-sm text-blue-700">
            Click any preset to instantly add it to your stream. You can
            customize the text, position, and styling after adding.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
