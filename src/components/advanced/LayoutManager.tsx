import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Grid,
  Layout,
  Monitor,
  PictureInPicture,
  Users,
  Plus,
  Save,
  Eye,
  Settings,
} from "lucide-react";
import { StreamLayout, LayoutZone } from "@/types/features";
import { cn } from "@/lib/utils";

interface LayoutManagerProps {
  currentLayout: StreamLayout;
  onLayoutChange: (layout: StreamLayout) => void;
  onLayoutSave: (layout: StreamLayout) => void;
  className?: string;
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({
  currentLayout,
  onLayoutChange,
  onLayoutSave,
  className,
}) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const predefinedLayouts: StreamLayout[] = [
    {
      id: "single",
      name: "Single Camera",
      type: "single",
      zones: [
        {
          id: "main",
          type: "video",
          position: { x: 0, y: 0, width: 100, height: 100 },
          settings: { source: "camera" },
        },
      ],
      preview: "📹",
      isCustom: false,
    },
    {
      id: "dual",
      name: "Dual View",
      type: "dual",
      zones: [
        {
          id: "left",
          type: "video",
          position: { x: 0, y: 0, width: 50, height: 100 },
          settings: { source: "camera" },
        },
        {
          id: "right",
          type: "video",
          position: { x: 50, y: 0, width: 50, height: 100 },
          settings: { source: "guest" },
        },
      ],
      preview: "👥",
      isCustom: false,
    },
    {
      id: "pip",
      name: "Picture in Picture",
      type: "picture-in-picture",
      zones: [
        {
          id: "main",
          type: "screen",
          position: { x: 0, y: 0, width: 100, height: 100 },
          settings: { source: "screen" },
        },
        {
          id: "overlay",
          type: "video",
          position: { x: 70, y: 70, width: 25, height: 25 },
          settings: { source: "camera" },
        },
      ],
      preview: "🖥️",
      isCustom: false,
    },
    {
      id: "grid",
      name: "Grid View",
      type: "grid",
      zones: [
        {
          id: "tl",
          type: "video",
          position: { x: 0, y: 0, width: 50, height: 50 },
          settings: { source: "camera" },
        },
        {
          id: "tr",
          type: "video",
          position: { x: 50, y: 0, width: 50, height: 50 },
          settings: { source: "guest1" },
        },
        {
          id: "bl",
          type: "video",
          position: { x: 0, y: 50, width: 50, height: 50 },
          settings: { source: "guest2" },
        },
        {
          id: "br",
          type: "video",
          position: { x: 50, y: 50, width: 50, height: 50 },
          settings: { source: "guest3" },
        },
      ],
      preview: "⊞",
      isCustom: false,
    },
  ];

  const handleZoneClick = useCallback(
    (zoneId: string) => {
      setSelectedZone(zoneId === selectedZone ? null : zoneId);
    },
    [selectedZone],
  );

  const handleZoneResize = useCallback(
    (zoneId: string, newPosition: LayoutZone["position"]) => {
      const updatedLayout = {
        ...currentLayout,
        zones: currentLayout.zones.map((zone) =>
          zone.id === zoneId ? { ...zone, position: newPosition } : zone,
        ),
      };
      onLayoutChange(updatedLayout);
    },
    [currentLayout, onLayoutChange],
  );

  const addNewZone = useCallback(() => {
    const newZone: LayoutZone = {
      id: `zone-${Date.now()}`,
      type: "video",
      position: { x: 10, y: 10, width: 30, height: 30 },
      settings: { source: "none" },
    };

    const updatedLayout = {
      ...currentLayout,
      zones: [...currentLayout.zones, newZone],
      type: "custom" as const,
      isCustom: true,
    };

    onLayoutChange(updatedLayout);
  }, [currentLayout, onLayoutChange]);

  const renderLayoutPreview = (layout: StreamLayout) => {
    return (
      <div className="relative w-24 h-16 bg-gray-900 rounded overflow-hidden">
        {layout.zones.map((zone) => (
          <div
            key={zone.id}
            className={cn(
              "absolute border-2 border-blue-400",
              zone.type === "video" && "bg-blue-200",
              zone.type === "screen" && "bg-green-200",
              zone.type === "image" && "bg-yellow-200",
              zone.type === "text" && "bg-purple-200",
            )}
            style={{
              left: `${zone.position.x}%`,
              top: `${zone.position.y}%`,
              width: `${zone.position.width}%`,
              height: `${zone.position.height}%`,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {layout.preview}
        </div>
      </div>
    );
  };

  const renderLayoutEditor = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Layout Editor</h3>
          <div className="flex gap-2">
            <Button
              variant={previewMode ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={addNewZone}>
              <Plus className="w-4 h-4 mr-2" />
              Add Zone
            </Button>
            <Button size="sm" onClick={() => onLayoutSave(currentLayout)}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Layout Canvas */}
        <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
          {currentLayout.zones.map((zone) => (
            <div
              key={zone.id}
              className={cn(
                "absolute border-2 cursor-move transition-all",
                selectedZone === zone.id
                  ? "border-blue-400 bg-blue-400/20"
                  : "border-gray-400 bg-gray-400/20",
                "hover:border-blue-300",
              )}
              style={{
                left: `${zone.position.x}%`,
                top: `${zone.position.y}%`,
                width: `${zone.position.width}%`,
                height: `${zone.position.height}%`,
              }}
              onClick={() => handleZoneClick(zone.id)}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {zone.type}
              </div>

              {/* Resize handles */}
              {selectedZone === zone.id && (
                <>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 cursor-se-resize" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 cursor-ne-resize" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 cursor-sw-resize" />
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 cursor-nw-resize" />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Zone Properties */}
        {selectedZone && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zone Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option value="video">Video</option>
                    <option value="screen">Screen</option>
                    <option value="image">Image</option>
                    <option value="text">Text</option>
                    <option value="widget">Widget</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Source</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option value="camera">Camera</option>
                    <option value="screen">Screen Share</option>
                    <option value="guest">Guest</option>
                    <option value="media">Media File</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs">X (%)</label>
                  <input
                    type="number"
                    className="w-full mt-1 p-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs">Y (%)</label>
                  <input
                    type="number"
                    className="w-full mt-1 p-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs">W (%)</label>
                  <input
                    type="number"
                    className="w-full mt-1 p-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs">H (%)</label>
                  <input
                    type="number"
                    className="w-full mt-1 p-1 border rounded text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="w-5 h-5" />
          Stream Layouts
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="presets">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Preset Layouts</TabsTrigger>
            <TabsTrigger value="custom">Custom Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {predefinedLayouts.map((layout) => (
                <div
                  key={layout.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                    currentLayout.id === layout.id &&
                      "border-blue-500 bg-blue-50",
                  )}
                  onClick={() => onLayoutChange(layout)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {renderLayoutPreview(layout)}
                    <div>
                      <h4 className="font-medium">{layout.name}</h4>
                      <p className="text-sm text-gray-500">
                        {layout.zones.length} zones
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {layout.type}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">{renderLayoutEditor()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
