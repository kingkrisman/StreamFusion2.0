import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Youtube,
  Twitch,
  Facebook,
  Twitter,
  Monitor,
} from "lucide-react";
import { ChatMessage } from "@/types/streaming";
import { cn } from "@/lib/utils";

interface LiveChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  className?: string;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case "youtube":
      return <Youtube className="w-4 h-4 text-red-600" />;
    case "twitch":
      return <Twitch className="w-4 h-4 text-purple-600" />;
    case "facebook":
      return <Facebook className="w-4 h-4 text-blue-600" />;
    case "x":
      return <Twitter className="w-4 h-4 text-black" />;
    case "studio":
      return <Monitor className="w-4 h-4 text-blue-600" />;
    default:
      return <MessageCircle className="w-4 h-4" />;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "youtube":
      return "bg-red-100 text-red-800 border-red-200";
    case "twitch":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "facebook":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "x":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "studio":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const LiveChat: React.FC<LiveChatProps> = ({
  messages,
  onSendMessage,
  className,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Live Chat
          <Badge variant="secondary" className="ml-auto">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-3 py-2">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={message.platform} />
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        getPlatformColor(message.platform),
                      )}
                    >
                      {message.platform}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {message.username}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-foreground pl-6">
                    {message.message}
                  </div>
                </div>
              ))
            )}
            <div ref={endOfMessagesRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message to your viewers..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Messages will appear in your stream overlay and be visible to all
            viewers
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
