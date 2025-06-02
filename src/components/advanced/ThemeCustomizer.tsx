import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Palette,
  Type,
  Image,
  Sparkles,
  Download,
  Upload,
  Eye,
  Save,
} from "lucide-react";
import { Theme, ThemeOverlay } from "@/types/features";
import { cn } from "@/lib/utils";

interface ThemeCustomizerProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onThemeSave: (theme: Theme) => void;
  className?: string;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  currentTheme,
  onThemeChange,
  onThemeSave,
  className,
}) => {
  const [previewMode, setPreviewMode] = useState(false);

  const predefinedThemes: Theme[] = [
    {
      id: "modern",
      name: "Modern Dark",
      colors: {
        primary: "#3B82F6",
        secondary: "#1F2937",
        accent: "#10B981",
        background: "#111827",
        text: "#F9FAFB",
      },
      fonts: {
        primary: "Inter, sans-serif",
        secondary: "JetBrains Mono, monospace",
      },
      overlays: [],
    },
    {
      id: "gaming",
      name: "Gaming RGB",
      colors: {
        primary: "#FF0080",
        secondary: "#8B5CF6",
        accent: "#00FF88",
        background: "#0D1117",
        text: "#FFFFFF",
      },
      fonts: {
        primary: "Orbitron, sans-serif",
        secondary: "Rajdhani, sans-serif",
      },
      overlays: [
        {
          id: "rgb-border",
          type: "border",
          settings: {
            width: 3,
            style: "gradient",
            colors: ["#FF0080", "#8B5CF6", "#00FF88"],
            animation: "rainbow",
          },
        },
      ],
    },
    {
      id: "professional",
      name: "Professional",
      colors: {
        primary: "#2563EB",
        secondary: "#F8FAFC",
        accent: "#0EA5E9",
        background: "#FFFFFF",
        text: "#1E293B",
      },
      fonts: {
        primary: "Roboto, sans-serif",
        secondary: "Source Sans Pro, sans-serif",
      },
      overlays: [],
    },
    {
      id: "neon",
      name: "Neon City",
      colors: {
        primary: "#FF006E",
        secondary: "#FB5607",
        accent: "#FFBE0B",
        background: "#000000",
        text: "#FFFFFF",
      },
      fonts: {
        primary: "Cyber, sans-serif",
        secondary: "Neon, monospace",
      },
      overlays: [
        {
          id: "neon-glow",
          type: "shadow",
          settings: {
            blur: 20,
            color: "#FF006E",
            intensity: 0.8,
          },
        },
      ],
    },
  ];

  const handleColorChange = useCallback(
    (colorKey: keyof Theme["colors"], value: string) => {
      const updatedTheme = {
        ...currentTheme,
        colors: {
          ...currentTheme.colors,
          [colorKey]: value,
        },
      };
      onThemeChange(updatedTheme);
    },
    [currentTheme, onThemeChange],
  );

  const handleFontChange = useCallback(
    (fontKey: keyof Theme["fonts"], value: string) => {
      const updatedTheme = {
        ...currentTheme,
        fonts: {
          ...currentTheme.fonts,
          [fontKey]: value,
        },
      };
      onThemeChange(updatedTheme);
    },
    [currentTheme, onThemeChange],
  );

  const addOverlay = useCallback(
    (type: ThemeOverlay["type"]) => {
      const newOverlay: ThemeOverlay = {
        id: `${type}-${Date.now()}`,
        type,
        settings: getDefaultOverlaySettings(type),
      };

      const updatedTheme = {
        ...currentTheme,
        overlays: [...currentTheme.overlays, newOverlay],
      };
      onThemeChange(updatedTheme);
    },
    [currentTheme, onThemeChange],
  );

  const getDefaultOverlaySettings = (type: ThemeOverlay["type"]) => {
    switch (type) {
      case "border":
        return { width: 2, color: currentTheme.colors.primary, style: "solid" };
      case "shadow":
        return { blur: 10, color: currentTheme.colors.primary, opacity: 0.5 };
      case "gradient":
        return {
          direction: "linear",
          colors: [currentTheme.colors.primary, currentTheme.colors.secondary],
          opacity: 0.8,
        };
      case "frame":
        return {
          style: "modern",
          thickness: 5,
          color: currentTheme.colors.accent,
          corners: "rounded",
        };
      default:
        return {};
    }
  };

  const renderColorPicker = (
    label: string,
    colorKey: keyof Theme["colors"],
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div
          className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
          style={{ backgroundColor: currentTheme.colors[colorKey] }}
        />
        <Input
          type="color"
          value={currentTheme.colors[colorKey]}
          onChange={(e) => handleColorChange(colorKey, e.target.value)}
          className="w-20"
        />
        <Input
          type="text"
          value={currentTheme.colors[colorKey]}
          onChange={(e) => handleColorChange(colorKey, e.target.value)}
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderThemePreview = () => (
    <div
      className="relative w-full h-40 rounded-lg overflow-hidden border-2"
      style={{
        backgroundColor: currentTheme.colors.background,
        borderColor: currentTheme.colors.primary,
      }}
    >
      {/* Preview content */}
      <div className="p-4 h-full flex flex-col justify-between">
        <div>
          <h3
            className="text-lg font-bold"
            style={{
              color: currentTheme.colors.text,
              fontFamily: currentTheme.fonts.primary,
            }}
          >
            Stream Title
          </h3>
          <p
            className="text-sm"
            style={{
              color: currentTheme.colors.text,
              opacity: 0.7,
              fontFamily: currentTheme.fonts.secondary,
            }}
          >
            Live streaming preview
          </p>
        </div>

        <div className="flex gap-2">
          <div
            className="px-3 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.background,
            }}
          >
            LIVE
          </div>
          <div
            className="px-3 py-1 rounded text-xs"
            style={{
              backgroundColor: currentTheme.colors.accent,
              color: currentTheme.colors.background,
            }}
          >
            123 viewers
          </div>
        </div>
      </div>

      {/* Apply overlays */}
      {currentTheme.overlays.map((overlay) => (
        <div
          key={overlay.id}
          className="absolute inset-0 pointer-events-none"
          style={getOverlayStyles(overlay)}
        />
      ))}
    </div>
  );

  const getOverlayStyles = (overlay: ThemeOverlay): React.CSSProperties => {
    switch (overlay.type) {
      case "border":
        return {
          border: `${overlay.settings.width}px ${overlay.settings.style} ${overlay.settings.color}`,
        };
      case "shadow":
        return {
          boxShadow: `0 0 ${overlay.settings.blur}px ${overlay.settings.color}`,
        };
      case "gradient":
        return {
          background: `linear-gradient(${overlay.settings.direction === "radial" ? "radial-gradient" : "45deg"}, ${overlay.settings.colors.join(", ")})`,
          opacity: overlay.settings.opacity,
        };
      default:
        return {};
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme Customizer
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="presets">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predefinedThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                    currentTheme.id === theme.id &&
                      "border-blue-500 bg-blue-50",
                  )}
                  onClick={() => onThemeChange(theme)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-1">
                      {Object.values(theme.colors)
                        .slice(0, 3)
                        .map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                    </div>
                    <h4 className="font-medium">{theme.name}</h4>
                  </div>

                  <div className="text-xs text-gray-500">
                    {theme.overlays.length} effects
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <div className="space-y-4">
              {renderColorPicker("Primary Color", "primary")}
              {renderColorPicker("Secondary Color", "secondary")}
              {renderColorPicker("Accent Color", "accent")}
              {renderColorPicker("Background Color", "background")}
              {renderColorPicker("Text Color", "text")}
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Preview
              </Label>
              {renderThemePreview()}
            </div>
          </TabsContent>

          <TabsContent value="fonts" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Primary Font</Label>
                <select
                  className="w-full mt-2 p-2 border rounded"
                  value={currentTheme.fonts.primary}
                  onChange={(e) => handleFontChange("primary", e.target.value)}
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Orbitron, sans-serif">Orbitron</option>
                  <option value="Rajdhani, sans-serif">Rajdhani</option>
                  <option value="JetBrains Mono, monospace">
                    JetBrains Mono
                  </option>
                </select>
              </div>

              <div>
                <Label>Secondary Font</Label>
                <select
                  className="w-full mt-2 p-2 border rounded"
                  value={currentTheme.fonts.secondary}
                  onChange={(e) =>
                    handleFontChange("secondary", e.target.value)
                  }
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Source Sans Pro, sans-serif">
                    Source Sans Pro
                  </option>
                  <option value="JetBrains Mono, monospace">
                    JetBrains Mono
                  </option>
                  <option value="Rajdhani, sans-serif">Rajdhani</option>
                </select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOverlay("border")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Border
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOverlay("shadow")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Shadow
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOverlay("gradient")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gradient
              </Button>
            </div>

            <div className="space-y-3">
              {currentTheme.overlays.map((overlay) => (
                <Card key={overlay.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">
                        {overlay.type} Effect
                      </span>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>

                    {/* Overlay-specific controls */}
                    {overlay.type === "border" && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs">Width</label>
                          <Slider
                            value={[overlay.settings.width || 2]}
                            max={10}
                            min={1}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs">Color</label>
                          <Input
                            type="color"
                            value={
                              overlay.settings.color ||
                              currentTheme.colors.primary
                            }
                            className="w-full h-8 mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {overlay.type === "shadow" && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs">Blur</label>
                          <Slider
                            value={[overlay.settings.blur || 10]}
                            max={50}
                            min={0}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs">Opacity</label>
                          <Slider
                            value={[overlay.settings.opacity || 0.5]}
                            max={1}
                            min={0}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {overlay.type === "gradient" && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs">Direction</label>
                          <select className="w-full mt-1 p-1 border rounded text-xs">
                            <option value="linear">Linear</option>
                            <option value="radial">Radial</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs">Opacity</label>
                          <Slider
                            value={[overlay.settings.opacity || 0.8]}
                            max={1}
                            min={0}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={() => onThemeSave(currentTheme)} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Theme
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
