import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Camera,
  Layers,
  Settings,
  Download,
  Upload,
  Play,
  Square,
} from "lucide-react";
import { AROverlay } from "@/types/features";
import { cn } from "@/lib/utils";

interface AROverlaySystemProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  overlays: AROverlay[];
  onOverlayUpdate: (overlays: AROverlay[]) => void;
  className?: string;
}

export const AROverlaySystem: React.FC<AROverlaySystemProps> = ({
  videoRef,
  isActive,
  overlays,
  onOverlayUpdate,
  className,
}) => {
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Predefined AR overlays
  const presetOverlays: AROverlay[] = [
    {
      id: "glasses",
      name: "Virtual Glasses",
      type: "face-filter",
      model: "/ar-models/glasses.glb",
      settings: {
        tracking: "face",
        position: { x: 0, y: -0.1, z: 0.05 },
        scale: 1.0,
        rotation: { x: 0, y: 0, z: 0 },
      },
      isActive: false,
    },
    {
      id: "hat",
      name: "Virtual Hat",
      type: "face-filter",
      model: "/ar-models/hat.glb",
      settings: {
        tracking: "face",
        position: { x: 0, y: -0.3, z: 0 },
        scale: 1.2,
        rotation: { x: 0, y: 0, z: 0 },
      },
      isActive: false,
    },
    {
      id: "background-office",
      name: "Virtual Office",
      type: "background",
      model: "/ar-models/office-bg.jpg",
      settings: {
        tracking: "environment",
        position: { x: 0, y: 0, z: -2 },
        scale: 1.0,
        rotation: { x: 0, y: 0, z: 0 },
      },
      isActive: false,
    },
    {
      id: "particles",
      name: "Magic Particles",
      type: "effects",
      settings: {
        tracking: "face",
        position: { x: 0, y: 0, z: 0.1 },
        scale: 1.0,
        rotation: { x: 0, y: 0, z: 0 },
      },
      isActive: false,
    },
    {
      id: "floating-logo",
      name: "Floating Logo",
      type: "3d-object",
      model: "/ar-models/logo.glb",
      settings: {
        tracking: "environment",
        position: { x: 0.5, y: 0.2, z: 0.3 },
        scale: 0.5,
        rotation: { x: 0, y: 45, z: 0 },
      },
      isActive: false,
    },
  ];

  // Initialize AR tracking (simplified simulation)
  useEffect(() => {
    if (isActive && videoRef.current && canvasRef.current) {
      startARTracking();
    } else {
      stopARTracking();
    }

    return () => stopARTracking();
  }, [isActive, videoRef]);

  const startARTracking = useCallback(async () => {
    setIsTracking(true);

    // Simulate AR tracking loop
    const trackingLoop = () => {
      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const video = videoRef.current;

        if (ctx && video.readyState >= 2) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Apply active AR overlays
          overlays
            .filter((overlay) => overlay.isActive)
            .forEach((overlay) => {
              renderAROverlay(ctx, overlay, canvas.width, canvas.height);
            });
        }
      }

      if (isTracking) {
        animationRef.current = requestAnimationFrame(trackingLoop);
      }
    };

    trackingLoop();
  }, [overlays, isTracking]);

  const stopARTracking = useCallback(() => {
    setIsTracking(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const renderAROverlay = (
    ctx: CanvasRenderingContext2D,
    overlay: AROverlay,
    width: number,
    height: number,
  ) => {
    const { position, scale } = overlay.settings;

    // Convert normalized coordinates to canvas coordinates
    const x = (position.x + 0.5) * width;
    const y = (position.y + 0.5) * height;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    switch (overlay.type) {
      case "face-filter":
        renderFaceFilter(ctx, overlay);
        break;
      case "background":
        renderBackground(ctx, overlay, width, height);
        break;
      case "effects":
        renderEffects(ctx, overlay);
        break;
      case "3d-object":
        render3DObject(ctx, overlay);
        break;
    }

    ctx.restore();
  };

  const renderFaceFilter = (
    ctx: CanvasRenderingContext2D,
    overlay: AROverlay,
  ) => {
    // Simulate face filter rendering
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(-30, -15, 60, 30);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(overlay.name, 0, 5);
  };

  const renderBackground = (
    ctx: CanvasRenderingContext2D,
    overlay: AROverlay,
    width: number,
    height: number,
  ) => {
    // Simulate background replacement
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#4A90E2";
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.globalAlpha = 1;
  };

  const renderEffects = (ctx: CanvasRenderingContext2D, overlay: AROverlay) => {
    // Simulate particle effects
    const time = Date.now() * 0.005;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time;
      const radius = 50;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      ctx.fillStyle = `hsl(${(i * 36 + time * 100) % 360}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const render3DObject = (
    ctx: CanvasRenderingContext2D,
    overlay: AROverlay,
  ) => {
    // Simulate 3D object rendering
    const time = Date.now() * 0.002;
    ctx.save();
    ctx.rotate(time);
    ctx.fillStyle = "#FF6B6B";
    ctx.fillRect(-20, -20, 40, 40);
    ctx.fillStyle = "#4ECDC4";
    ctx.fillRect(-15, -15, 30, 30);
    ctx.restore();
  };

  const toggleOverlay = useCallback(
    (overlayId: string) => {
      const updatedOverlays = overlays.map((overlay) =>
        overlay.id === overlayId
          ? { ...overlay, isActive: !overlay.isActive }
          : overlay,
      );
      onOverlayUpdate(updatedOverlays);
    },
    [overlays, onOverlayUpdate],
  );

  const updateOverlaySettings = useCallback(
    (overlayId: string, settings: Partial<AROverlay["settings"]>) => {
      const updatedOverlays = overlays.map((overlay) =>
        overlay.id === overlayId
          ? { ...overlay, settings: { ...overlay.settings, ...settings } }
          : overlay,
      );
      onOverlayUpdate(updatedOverlays);
    },
    [overlays, onOverlayUpdate],
  );

  const addPresetOverlay = useCallback(
    (preset: AROverlay) => {
      const newOverlay = { ...preset, id: `${preset.id}-${Date.now()}` };
      onOverlayUpdate([...overlays, newOverlay]);
    },
    [overlays, onOverlayUpdate],
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AR Overlays
          {isTracking && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <span className="text-xs">Tracking</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overlays">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overlays">Active</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overlays" className="space-y-4">
            {/* AR Canvas Preview */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="w-full h-48 bg-gray-900 rounded-lg border"
              />
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center text-white">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">AR Preview Disabled</p>
                  </div>
                </div>
              )}
            </div>

            {/* Active Overlays */}
            <div className="space-y-2">
              <h4 className="font-medium">Active Overlays</h4>
              {overlays.filter((overlay) => overlay.isActive).length === 0 ? (
                <p className="text-sm text-gray-500">No active overlays</p>
              ) : (
                overlays
                  .filter((overlay) => overlay.isActive)
                  .map((overlay) => (
                    <div
                      key={overlay.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Layers className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{overlay.name}</div>
                          <div className="text-sm text-gray-500">
                            {overlay.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOverlay(overlay.id)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={overlay.isActive}
                          onCheckedChange={() => toggleOverlay(overlay.id)}
                        />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {presetOverlays.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {preset.type.replace("-", " ")}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addPresetOverlay(preset)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {selectedOverlay && (
              <div className="space-y-4">
                <h4 className="font-medium">Overlay Settings</h4>

                {/* Position Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">X Position</label>
                    <Slider
                      value={[
                        overlays.find((o) => o.id === selectedOverlay)?.settings
                          .position.x || 0,
                      ]}
                      onValueChange={([value]) =>
                        updateOverlaySettings(selectedOverlay, {
                          position: {
                            ...overlays.find((o) => o.id === selectedOverlay)
                              ?.settings.position!,
                            x: value,
                          },
                        })
                      }
                      min={-1}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Y Position</label>
                    <Slider
                      value={[
                        overlays.find((o) => o.id === selectedOverlay)?.settings
                          .position.y || 0,
                      ]}
                      onValueChange={([value]) =>
                        updateOverlaySettings(selectedOverlay, {
                          position: {
                            ...overlays.find((o) => o.id === selectedOverlay)
                              ?.settings.position!,
                            y: value,
                          },
                        })
                      }
                      min={-1}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Scale</label>
                    <Slider
                      value={[
                        overlays.find((o) => o.id === selectedOverlay)?.settings
                          .scale || 1,
                      ]}
                      onValueChange={([value]) =>
                        updateOverlaySettings(selectedOverlay, { scale: value })
                      }
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">AR System</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Face Tracking</span>
                  <Switch checked={isTracking} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Environment Mapping</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hand Tracking</span>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
