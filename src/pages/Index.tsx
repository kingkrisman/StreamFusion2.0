import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Monitor,
  Users,
  MessageCircle,
  Youtube,
  Twitch,
  Facebook,
  Twitter,
  Video,
  Mic,
  Settings,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Monitor,
      title: "Multi-Platform Streaming",
      description: "Stream to YouTube, Twitch, Facebook, and X simultaneously",
    },
    {
      icon: Users,
      title: "Guest Invitations",
      description: "Invite guests to join your stream with simple links",
    },
    {
      icon: MessageCircle,
      title: "Live Chat Integration",
      description: "See comments from all platforms in real-time",
    },
    {
      icon: Video,
      title: "Recording & Download",
      description: "Record your streams and download them instantly",
    },
  ];

  const platforms = [
    { name: "YouTube", icon: Youtube, color: "text-red-600" },
    { name: "Twitch", icon: Twitch, color: "text-purple-600" },
    { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { name: "X", icon: Twitter, color: "text-black" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">StreamFusion</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link to="/studio">
              <Button className="bg-red-600 hover:bg-red-700">
                <Play className="w-4 h-4 mr-2" />
                Go Live
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4" variant="secondary">
            Live Streaming Platform
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Stream to Multiple Platforms
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Simultaneously
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional live streaming directly from your browser. No downloads
            required. Stream to YouTube, Twitch, Facebook, and X all at once
            with guest support and real-time chat integration.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Link to="/studio">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                <Play className="w-5 h-5 mr-2" />
                Start Streaming Now
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline">
                <Settings className="w-5 h-5 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Platform Icons */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <span className="text-sm text-gray-500">Stream to:</span>
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center gap-2">
                <platform.icon className={`w-6 h-6 ${platform.color}`} />
                <span className="text-sm font-medium">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Professional Streaming
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features that make live streaming simple and
              professional, all accessible directly from your web browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-gray-600">
              No software downloads. No complex setup. Just professional
              streaming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Platforms</h3>
              <p className="text-gray-600">
                Link your streaming accounts with simple RTMP configuration
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Setup Your Stream</h3>
              <p className="text-gray-600">
                Configure your camera, microphone, and invite guests if needed
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Go Live</h3>
              <p className="text-gray-600">
                Start streaming to all platforms simultaneously with one click
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Streaming?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who trust StreamFusion for their live
            streaming needs.
          </p>
          <Link to="/studio">
            <Button size="lg" variant="secondary">
              <Play className="w-5 h-5 mr-2" />
              Start Your First Stream
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">StreamFusion</span>
          </div>
          <div className="text-center text-gray-400">
            <p>
              &copy; 2024 StreamFusion. Professional live streaming made simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
