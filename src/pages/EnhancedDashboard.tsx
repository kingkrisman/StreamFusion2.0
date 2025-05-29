import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Settings,
  Monitor,
  Users,
  Eye,
  Clock,
  TrendingUp,
  Video,
  Calendar,
  Download,
  Share,
  BarChart3,
  Activity,
  Zap,
  Globe,
  Wifi,
  HardDrive,
} from "lucide-react";
import { Link } from "react-router-dom";

const EnhancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Enhanced mock data
  const stats = {
    totalStreams: 24,
    totalHours: 87.5,
    totalViewers: 3250,
    averageViewers: 135,
    peakViewers: 298,
    totalFollowers: 1420,
    subscriberGrowth: 12.5,
    engagement: 8.3,
  };

  const recentStreams = [
    {
      id: 1,
      title: "Weekly Tech Review - New GPUs Released!",
      date: "2024-01-15",
      duration: "2h 15m",
      viewers: 298,
      peakViewers: 298,
      chatMessages: 1247,
      platforms: ["YouTube", "Twitch"],
      revenue: 24.5,
      status: "completed",
    },
    {
      id: 2,
      title: "Product Launch Event - StreamFusion 2.0",
      date: "2024-01-12",
      duration: "1h 45m",
      viewers: 156,
      peakViewers: 189,
      chatMessages: 892,
      platforms: ["YouTube", "Facebook", "X"],
      revenue: 18.25,
      status: "completed",
    },
    {
      id: 3,
      title: "Q&A Session with Community",
      date: "2024-01-10",
      duration: "45m",
      viewers: 67,
      peakViewers: 78,
      chatMessages: 334,
      platforms: ["Twitch"],
      revenue: 8.75,
      status: "completed",
    },
  ];

  const analytics = {
    viewersByPlatform: [
      { platform: "YouTube", viewers: 1200, percentage: 37 },
      { platform: "Twitch", viewers: 980, percentage: 30 },
      { platform: "Facebook", viewers: 650, percentage: 20 },
      { platform: "X", viewers: 420, percentage: 13 },
    ],
    topStreams: [
      { title: "Product Launch Event", viewers: 298, engagement: 9.2 },
      { title: "Weekly Tech Review", viewers: 245, engagement: 8.8 },
      { title: "Gaming Session", viewers: 189, engagement: 7.5 },
    ],
  };

  const systemHealth = {
    cpuUsage: 45,
    memoryUsage: 62,
    networkSpeed: 85,
    streamQuality: 98,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Dashboard</h1>
          <p className="text-muted-foreground">
            Complete analytics and management for your streaming platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Link to="/studio">
            <Button className="bg-red-600 hover:bg-red-700">
              <Play className="w-4 h-4 mr-2" />
              Go Live
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Streams
                  </span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {stats.totalStreams}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +15% this month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Viewers
                  </span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {stats.totalViewers.toLocaleString()}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />+
                  {stats.subscriberGrowth}% growth
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Peak Viewers
                  </span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {stats.peakViewers}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Avg: {stats.averageViewers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Engagement
                  </span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {stats.engagement}%
                </div>
                <div className="text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  Above average
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStreams.slice(0, 3).map((stream, index) => (
                    <div key={stream.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{stream.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {stream.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {stream.viewers} viewers
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          ${stream.revenue}
                        </Badge>
                      </div>
                      {index < 2 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/studio">
                  <Button className="w-full justify-start" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Start New Stream
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Stream
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  View Recordings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Platform Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Viewers by Platform</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.viewersByPlatform.map((item) => (
                  <div key={item.platform} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.platform}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.viewers} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Streams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topStreams.map((stream, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{stream.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {stream.viewers} viewers
                      </div>
                    </div>
                    <Badge variant="outline">
                      {stream.engagement}% engagement
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Streams Tab */}
        <TabsContent value="streams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stream History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStreams.map((stream) => (
                  <div key={stream.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{stream.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {stream.date} • {stream.duration}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        ${stream.revenue}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Viewers</div>
                        <div className="font-medium">{stream.viewers}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Peak</div>
                        <div className="font-medium">{stream.peakViewers}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Messages</div>
                        <div className="font-medium">{stream.chatMessages}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Platforms</div>
                        <div className="flex gap-1">
                          {stream.platforms.map((platform) => (
                            <Badge
                              key={platform}
                              variant="secondary"
                              className="text-xs"
                            >
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      CPU Usage
                    </span>
                    <span>{systemHealth.cpuUsage}%</span>
                  </div>
                  <Progress value={systemHealth.cpuUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Memory Usage
                    </span>
                    <span>{systemHealth.memoryUsage}%</span>
                  </div>
                  <Progress value={systemHealth.memoryUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      Network Speed
                    </span>
                    <span>{systemHealth.networkSpeed}%</span>
                  </div>
                  <Progress value={systemHealth.networkSpeed} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Stream Quality
                    </span>
                    <span>{systemHealth.streamQuality}%</span>
                  </div>
                  <Progress value={systemHealth.streamQuality} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {["YouTube", "Twitch", "Facebook", "X"].map((platform) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{platform}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDashboard;
