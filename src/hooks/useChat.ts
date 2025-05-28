import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessage } from "@/types/streaming";

export const useChat = (roomId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendMessage = useCallback(
    (content: string, platform: string = "studio") => {
      if (socket && isConnected) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          platform,
          username: "Host",
          message: content,
          timestamp: new Date(),
        };

        socket.emit("chat:message", message);
        addMessage(message);
      }
    },
    [socket, isConnected, addMessage],
  );

  const connectToRoom = useCallback(
    (newRoomId: string) => {
      if (socket) {
        socket.emit("room:join", newRoomId);
      }
    },
    [socket],
  );

  useEffect(() => {
    // For now, we'll simulate a socket connection
    // In production, you'd connect to your actual socket server
    const mockSocket = {
      emit: (event: string, data: any) => {
        console.log("Socket emit:", event, data);
      },
      on: (event: string, callback: (data: any) => void) => {
        console.log("Socket on:", event);
        return mockSocket;
      },
      off: (event: string, callback?: (data: any) => void) => {
        console.log("Socket off:", event);
        return mockSocket;
      },
      disconnect: () => {
        console.log("Socket disconnect");
      },
    } as any;

    setSocket(mockSocket);
    setIsConnected(true);

    // Simulate receiving messages from different platforms
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const platforms = ["YouTube", "Twitch", "Facebook", "X"];
        const usernames = ["viewer123", "streamfan", "techgeek", "livewatcher"];
        const sampleMessages = [
          "Great stream!",
          "Hello from YouTube!",
          "Love this content",
          "Can you show that again?",
          "Amazing quality!",
          "Hi everyone!",
        ];

        const message: ChatMessage = {
          id: Date.now().toString(),
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          username: usernames[Math.floor(Math.random() * usernames.length)],
          message:
            sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
          timestamp: new Date(),
        };

        addMessage(message);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
      setSocket(null);
    };
  }, [addMessage]);

  return {
    socket,
    messages,
    isConnected,
    sendMessage,
    connectToRoom,
    addMessage,
  };
};
