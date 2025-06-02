import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverlayPresets } from "./OverlayPresets";
import {
  Layers,
  Plus,
  Image,
  Type,
  Eye,
  EyeOff,
  Move,
  Trash2,
  Upload,
  Sparkles,
} from "lucide-react";
import { StreamOverlay } from "@/types/streaming";

interface StreamOverlaysProps {
  overlays: StreamOverlay[];
  onAddOverlay: (overlay: Omit<StreamOverlay, "id">) => void;
  onUpdateOverlay: (id: string, updates: Partial<StreamOverlay>) => void;
  onDeleteOverlay: (id: string) => void;
  className?: string;
}

export const StreamOverlays: React.FC<StreamOverlaysProps> = ({
  overlays,
  onAddOverlay,
  onUpdateOverlay,
  onDeleteOverlay,
  className,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("logo");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textSize, setTextSize] = useState([24]);
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [size, setSize] = useState({ width: 200, height: 100 });

  const handleAddLogo = () => {
    if (!logoFile) return;

    const logoUrl = URL.createObjectURL(logoFile);
    onAddOverlay({
      type: "logo",
      content: logoUrl,
      position,
      size,
      visible: true,
    });

    setLogoFile(null);
    setDialogOpen(false);
  };

  const handleAddText = () => {
    if (!textContent.trim()) return;

    onAddOverlay({
      type: "text",
      content: textContent,
      position,
      size: {
        width: textContent.length * textSize[0] * 0.6,
        height: textSize[0] * 1.2,
      },
      visible: true,
      textStyle: {
        fontSize: textSize[0],
        color: textColor,
        fontWeight: "normal",
        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
      },
    });

    setTextContent("");
    setDialogOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Stream Overlays
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Overlay
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stream Overlay</DialogTitle>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="presets">Presets</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="logo">Logo</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                </TabsList>

                <TabsContent value="presets" className="space-y-4">
                  <OverlayPresets
                    onAddOverlay={(overlay) => {
                      onAddOverlay(overlay);
                      setDialogOpen(false);
                    }}
                  />
                </TabsContent>

                <TabsContent value="logo" className="space-y-4">
                  <div>
                    <Label>Upload Logo</Label>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                    {logoFile && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ {logoFile.name} selected
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>X Position (%)</Label>
                      <Slider
                        value={[position.x]}
                        onValueChange={(value) =>
                          setPosition((prev) => ({ ...prev, x: value[0] }))
                        }
                        max={100}
                        step={1}
                      />
                    </div>
                    <div>
                      <Label>Y Position (%)</Label>
                      <Slider
                        value={[position.y]}
                        onValueChange={(value) =>
                          setPosition((prev) => ({ ...prev, y: value[0] }))
                        }
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Width (px)</Label>
                      <Input
                        type="number"
                        value={size.width}
                        onChange={(e) =>
                          setSize((prev) => ({
                            ...prev,
                            width: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        value={size.height}
                        onChange={(e) =>
                          setSize((prev) => ({
                            ...prev,
                            height: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {logoFile && (
                    <div className="p-4 bg-black rounded-lg relative overflow-hidden">
                      <div className="aspect-video relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="text-gray-400 text-sm">
                            Video Preview
                          </div>
                        </div>
                        <div
                          className="absolute"
                          style={{
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                            width: `${size.width * 0.3}px`, // Scaled down for preview
                            height: `${size.height * 0.3}px`,
                          }}
                        >
                          <img
                            src={URL.createObjectURL(logoFile)}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleAddLogo}
                    disabled={!logoFile}
                    className="w-full"
                  >
                    Add Logo Overlay
                  </Button>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label>Text Content</Label>
                    <Input
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Enter text to display"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Font Size</Label>
                      <Slider
                        value={textSize}
                        onValueChange={setTextSize}
                        min={12}
                        max={72}
                        step={2}
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {textSize[0]}px
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>X Position (%)</Label>
                      <Slider
                        value={[position.x]}
                        onValueChange={(value) =>
                          setPosition((prev) => ({ ...prev, x: value[0] }))
                        }
                        max={100}
                        step={1}
                      />
                    </div>
                    <div>
                      <Label>Y Position (%)</Label>
                      <Slider
                        value={[position.y]}
                        onValueChange={(value) =>
                          setPosition((prev) => ({ ...prev, y: value[0] }))
                        }
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {textContent && (
                    <div className="p-4 bg-black rounded-lg relative overflow-hidden">
                      <div className="aspect-video relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="text-gray-400 text-sm">
                            Video Preview
                          </div>
                        </div>
                        <div
                          className="absolute"
                          style={{
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                            fontSize: `${textSize[0] * 0.5}px`, // Scaled down for preview
                            color: textColor,
                            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                          }}
                        >
                          {textContent}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleAddText}
                    disabled={!textContent.trim()}
                    className="w-full"
                  >
                    Add Text Overlay
                  </Button>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <div className="text-center text-muted-foreground py-8">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Custom image overlays</p>
                    <p className="text-sm">Coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Presets */}
        {overlays.length === 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Quick Start with Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  name: "Welcome",
                  content: "Welcome to the Stream!",
                  color: "#FFD700",
                },
                {
                  name: "Subscribe",
                  content: "Don't forget to subscribe!",
                  color: "#FF6B6B",
                },
                { name: "Live", content: "🔴 LIVE", color: "#FF0000" },
                {
                  name: "Thanks",
                  content: "Thanks for watching! ⭐",
                  color: "#FFD700",
                },
              ].map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAddOverlay({
                      type: "text",
                      content: preset.content,
                      position: { x: 10 + index * 20, y: 10 + index * 10 },
                      size: { width: preset.content.length * 15, height: 30 },
                      visible: true,
                      textStyle: {
                        fontSize: 24,
                        color: preset.color,
                        fontWeight: "bold",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      },
                    });
                  }}
                  className="justify-start"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {overlays.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No overlays added</p>
            <p className="text-sm">
              Use quick presets above or create custom overlays
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {overlays.map((overlay) => (
              <div
                key={overlay.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded">
                    {overlay.type === "logo" && <Image className="w-4 h-4" />}
                    {overlay.type === "text" && <Type className="w-4 h-4" />}
                    {overlay.type === "image" && <Image className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="font-medium capitalize">
                      {overlay.type} Overlay
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {overlay.type === "text"
                        ? overlay.content
                        : "Media overlay"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Position: {overlay.position.x}%, {overlay.position.y}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onUpdateOverlay(overlay.id, { visible: !overlay.visible })
                    }
                  >
                    {overlay.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>

                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Move className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600"
                    onClick={() => onDeleteOverlay(overlay.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {overlays.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Overlays appear on top of your video feed during streaming
          </div>
        )}
      </CardContent>
    </Card>
  );
};
