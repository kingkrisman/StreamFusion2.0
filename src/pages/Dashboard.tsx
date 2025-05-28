import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Mic,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  // Mock data for the dashboard
  const stats = {
    totalStreams: 12,
    totalHours: 45.2,
    totalViewers: 1250,
    averageViewers: 104,
  };

  const recentStreams = [
    {
      id: 1,
      title: "Weekly Tech Review",
      date: "2024-01-15",
      duration: "2h 15m",
      viewers: 89,
      platforms: ["YouTube", "Twitch"],
    },
    {
      id: 2,
      title: "Product Launch Event",
      date: "2024-01-12",
      duration: "1h 45m",
      viewers: 156,
      platforms: ["YouTube", "Facebook", "X"],
    },
    {
      id: 3,
      title: "Q&A Session",
      date: "2024-01-10",
      duration: "45m",
      viewers: 67,
      platforms: ["Twitch"],
    },
  ];

  const quickActions = [
    {
      title: "Start New Stream",
      description: "Go live to your connected platforms",
      icon: Play,
      href: "/studio",
      variant: "default" as const,
    },
    {
      title: "Stream Settings",
      description: "Configure platforms and preferences",
      icon: Settings,
      href: "/studio",
      variant: "outline" as const,
    },
    {
      title: "Recordings",
      description: "View and download past recordings",
      icon: Video,
      href: "#",
      variant: "outline" as const,
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your streaming activity and performance
          </p>
        </div>
        <Link to="/studio">
          <Button className="bg-red-600 hover:bg-red-700">
            <Play className="w-4 h-4 mr-2" />
            Go Live
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <Link to={action.href} className="block">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <action.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Streams
              </span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.totalStreams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">
                Hours Streamed
              </span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.totalHours}h</div>
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">
                Avg. Viewers
              </span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {stats.averageViewers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Streams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Streams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentStreams.map((stream, index) => (
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
                        <Clock className="w-3 h-3" />
                        {stream.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {stream.viewers} viewers
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
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
                {index < recentStreams.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["YouTube", "Twitch", "Facebook", "X"].map((platform) => (
              <div
                key={platform}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{platform}</span>
                <Badge variant="secondary">Not Connected</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/studio">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure Platforms
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
