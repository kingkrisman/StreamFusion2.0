import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Widget,
  Plus,
  MessageCircle,
  DollarSign,
  Users,
  Bell,
  BarChart3,
  Timer,
  Vote,
  Settings,
  Trash2,
  Move,
} from "lucide-react";
import { StreamWidget, WidgetSettings } from "@/types/features";
import { cn } from "@/lib/utils";

interface WidgetSystemProps {
  widgets: StreamWidget[];
  onWidgetUpdate: (widgets: StreamWidget[]) => void;
  onWidgetPositionChange: (
    widgetId: string,
    position: { x: number; y: number },
  ) => void;
  className?: string;
}

export const WidgetSystem: React.FC<WidgetSystemProps> = ({
  widgets,
  onWidgetUpdate,
  onWidgetPositionChange,
  className,
}) => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const availableWidgets = [
    {
      type: "chat" as const,
      name: "Live Chat",
      description: "Display live chat messages from all platforms",
      icon: MessageCircle,
      defaultSettings: {
        theme: "modern",
        animation: "slide",
        maxMessages: 10,
        showPlatformIcons: true,
      },
    },
    {
      type: "donations" as const,
      name: "Donation Alerts",
      description: "Show donation notifications and goals",
      icon: DollarSign,
      defaultSettings: {
        theme: "celebration",
        animation: "bounce",
        duration: 5000,
        sound: true,
        minimumAmount: 1,
      },
    },
    {
      type: "followers" as const,
      name: "Follower Count",
      description: "Display current follower count with live updates",
      icon: Users,
      defaultSettings: {
        theme: "counter",
        animation: "fade",
        showGrowth: true,
        updateInterval: 5000,
      },
    },
    {
      type: "alerts" as const,
      name: "Stream Alerts",
      description: "Show new follows, subscriptions, and other events",
      icon: Bell,
      defaultSettings: {
        theme: "notification",
        animation: "slide",
        duration: 3000,
        sound: true,
        showGifs: true,
      },
    },
    {
      type: "stats" as const,
      name: "Live Statistics",
      description: "Real-time viewer count and engagement metrics",
      icon: BarChart3,
      defaultSettings: {
        theme: "minimal",
        showViewers: true,
        showEngagement: true,
        showUptime: true,
      },
    },
    {
      type: "timer" as const,
      name: "Stream Timer",
      description: "Countdown timer for events and breaks",
      icon: Timer,
      defaultSettings: {
        theme: "digital",
        format: "HH:MM:SS",
        autoStart: false,
        sound: true,
      },
    },
    {
      type: "polls" as const,
      name: "Live Polls",
      description: "Interactive polls for audience engagement",
      icon: Vote,
      defaultSettings: {
        theme: "interactive",
        animation: "fade",
        duration: 60000,
        showResults: true,
      },
    },
  ];

  const addWidget = useCallback(
    (type: StreamWidget["type"]) => {
      const widgetTemplate = availableWidgets.find((w) => w.type === type);
      if (!widgetTemplate) return;

      const newWidget: StreamWidget = {
        id: `${type}-${Date.now()}`,
        name: widgetTemplate.name,
        type,
        position: { x: 50, y: 50 },
        size: { width: 300, height: 200 },
        settings: widgetTemplate.defaultSettings,
        isVisible: true,
      };

      onWidgetUpdate([...widgets, newWidget]);
    },
    [widgets, onWidgetUpdate],
  );

  const removeWidget = useCallback(
    (widgetId: string) => {
      onWidgetUpdate(widgets.filter((w) => w.id !== widgetId));
    },
    [widgets, onWidgetUpdate],
  );

  const toggleWidget = useCallback(
    (widgetId: string) => {
      const updatedWidgets = widgets.map((widget) =>
        widget.id === widgetId
          ? { ...widget, isVisible: !widget.isVisible }
          : widget,
      );
      onWidgetUpdate(updatedWidgets);
    },
    [widgets, onWidgetUpdate],
  );

  const updateWidgetSettings = useCallback(
    (widgetId: string, settings: Partial<WidgetSettings>) => {
      const updatedWidgets = widgets.map((widget) =>
        widget.id === widgetId
          ? { ...widget, settings: { ...widget.settings, ...settings } }
          : widget,
      );
      onWidgetUpdate(updatedWidgets);
    },
    [widgets, onWidgetUpdate],
  );

  const renderWidget = (widget: StreamWidget) => {
    const IconComponent =
      availableWidgets.find((w) => w.type === widget.type)?.icon || Widget;

    return (
      <div
        key={widget.id}
        className={cn(
          "absolute border-2 rounded-lg bg-white shadow-lg transition-all",
          selectedWidget === widget.id ? "border-blue-500" : "border-gray-300",
          !widget.isVisible && "opacity-50",
        )}
        style={{
          left: `${widget.position.x}%`,
          top: `${widget.position.y}%`,
          width: `${Math.min(widget.size.width, 400)}px`,
          height: `${Math.min(widget.size.height, 300)}px`,
        }}
        onClick={() => setSelectedWidget(widget.id)}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-t-lg border-b">
          <div className="flex items-center gap-2">
            <IconComponent className="w-4 h-4" />
            <span className="text-sm font-medium">{widget.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleWidget(widget.id)}
            >
              {widget.isVisible ? "👁️" : "🚫"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => removeWidget(widget.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Widget Content Preview */}
        <div className="p-3 h-full overflow-hidden">
          {renderWidgetPreview(widget)}
        </div>

        {/* Resize Handle */}
        {selectedWidget === widget.id && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize" />
        )}
      </div>
    );
  };

  const renderWidgetPreview = (widget: StreamWidget) => {
    switch (widget.type) {
      case "chat":
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Live Chat Preview</div>
            <div className="space-y-1">
              <div className="text-xs bg-gray-100 p-1 rounded">
                User1: Hello everyone!
              </div>
              <div className="text-xs bg-gray-100 p-1 rounded">
                User2: Great stream! 🔥
              </div>
              <div className="text-xs bg-gray-100 p-1 rounded">
                User3: Keep it up!
              </div>
            </div>
          </div>
        );

      case "donations":
        return (
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-2">Donation Goal</div>
            <div className="text-lg font-bold text-green-600">$250</div>
            <div className="text-xs text-gray-500">of $500 goal</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full w-1/2"></div>
            </div>
          </div>
        );

      case "followers":
        return (
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-2">Followers</div>
            <div className="text-2xl font-bold text-blue-600">1,234</div>
            <div className="text-xs text-green-600">+5 today</div>
          </div>
        );

      case "stats":
        return (
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-500">Viewers</div>
              <div className="font-bold text-purple-600">89</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Uptime</div>
              <div className="font-bold text-orange-600">2:15:30</div>
            </div>
          </div>
        );

      case "timer":
        return (
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-2">Break Timer</div>
            <div className="text-xl font-mono font-bold">05:00</div>
            <Button size="sm" className="mt-2">
              Start
            </Button>
          </div>
        );

      case "polls":
        return (
          <div>
            <div className="text-xs text-gray-500 mb-2">Active Poll</div>
            <div className="text-sm font-medium mb-2">
              What should we do next?
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Option A</span>
                <span>45%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Option B</span>
                <span>55%</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500">
            <Widget className="w-8 h-8 mx-auto mb-2" />
            <div className="text-xs">Widget Preview</div>
          </div>
        );
    }
  };

  const renderWidgetSettings = () => {
    const selectedWidgetData = widgets.find((w) => w.id === selectedWidget);
    if (!selectedWidgetData) return null;

    return (
      <div className="space-y-4">
        <h4 className="font-medium">Widget Settings</h4>

        {/* Common Settings */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Theme</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={selectedWidgetData.settings.theme || "modern"}
              onChange={(e) =>
                updateWidgetSettings(selectedWidget!, { theme: e.target.value })
              }
            >
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="gaming">Gaming</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Animation</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={selectedWidgetData.settings.animation || "fade"}
              onChange={(e) =>
                updateWidgetSettings(selectedWidget!, {
                  animation: e.target.value,
                })
              }
            >
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="bounce">Bounce</option>
            </select>
          </div>
        </div>

        {/* Widget-specific Settings */}
        {selectedWidgetData.type === "chat" && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Max Messages</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded"
                value={selectedWidgetData.settings.maxMessages || 10}
                onChange={(e) =>
                  updateWidgetSettings(selectedWidget!, {
                    maxMessages: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Platform Icons</label>
              <Switch
                checked={selectedWidgetData.settings.showPlatformIcons || false}
                onCheckedChange={(checked) =>
                  updateWidgetSettings(selectedWidget!, {
                    showPlatformIcons: checked,
                  })
                }
              />
            </div>
          </div>
        )}

        {selectedWidgetData.type === "donations" && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Minimum Amount ($)</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded"
                value={selectedWidgetData.settings.minimumAmount || 1}
                onChange={(e) =>
                  updateWidgetSettings(selectedWidget!, {
                    minimumAmount: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Display Duration (ms)
              </label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded"
                value={selectedWidgetData.settings.duration || 5000}
                onChange={(e) =>
                  updateWidgetSettings(selectedWidget!, {
                    duration: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Play Sound</label>
              <Switch
                checked={selectedWidgetData.settings.sound || false}
                onCheckedChange={(checked) =>
                  updateWidgetSettings(selectedWidget!, { sound: checked })
                }
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Widget className="w-5 h-5" />
          Stream Widgets
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="canvas">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
            <TabsTrigger value="widgets">Available</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="canvas">
            {/* Widget Canvas */}
            <div className="relative w-full h-64 bg-gray-900 rounded-lg border overflow-hidden">
              {widgets.map(renderWidget)}

              {widgets.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Widget className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No widgets added</p>
                    <p className="text-xs">
                      Go to Available tab to add widgets
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Click widgets to select • Drag to reposition • Use settings tab to
              customize
            </div>
          </TabsContent>

          <TabsContent value="widgets">
            <div className="space-y-3">
              {availableWidgets.map((widget) => (
                <div
                  key={widget.type}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <widget.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{widget.name}</div>
                      <div className="text-sm text-gray-500">
                        {widget.description}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addWidget(widget.type)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            {selectedWidget ? (
              renderWidgetSettings()
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Settings className="w-8 h-8 mx-auto mb-2" />
                <p>Select a widget to customize its settings</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
