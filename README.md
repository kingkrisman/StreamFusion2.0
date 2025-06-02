# 🎥 StreamFusion - Professional Live Streaming Platform

**StreamFusion** is a comprehensive, browser-based live streaming platform that enables users to stream to multiple platforms simultaneously without requiring software downloads. Built with React, TypeScript, and modern web technologies.

![StreamFusion Banner](https://via.placeholder.com/1200x400/2563eb/ffffff?text=StreamFusion+Live+Streaming+Platform)

## ✨ Features

### 🚀 Core Streaming Capabilities

- **Multi-Platform Streaming**: Stream to YouTube, Twitch, Facebook, and X simultaneously
- **Browser-Based**: No downloads required - stream directly from your web browser
- **WebRTC Guest Support**: Invite guests to join your stream with real-time video/audio
- **Real-Time Chat Integration**: Aggregate chat from all platforms in one interface
- **Recording & Download**: Record streams locally and download for later use

### 🎛️ Professional Studio Features

- **Advanced Video Controls**: Camera switching, screen sharing, picture-in-picture
- **Stream Overlays**: Drag-and-drop text, logos, and image overlays with real-time editing
- **Analytics Dashboard**: Live viewer counts, engagement metrics, and stream analytics
- **Stream Scheduling**: Plan and schedule streams in advance
- **Custom Themes**: Professional themes and branding options

### 🔧 Technical Features

- **WebRTC Technology**: Real-time peer-to-peer communication
- **RTMP Integration**: Professional streaming protocol support
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Progressive Web App**: Install as a native app experience
- **Permission Management**: Intelligent camera/microphone permission handling

## 🎯 Demo

🌐 **Live Demo**: [https://builder-project-2045e575-af73-492b-b3bf-b5725693a889.fly.dev/](https://builder-project-2045e575-af73-492b-b3bf-b5725693a889.fly.dev/)

### Quick Links

- [Professional Studio](https://builder-project-2045e575-af73-492b-b3bf-b5725693a889.fly.dev/real-studio) - Full-featured streaming interface
- [Dashboard](https://builder-project-2045e575-af73-492b-b3bf-b5725693a889.fly.dev/dashboard) - Analytics and stream management
- [Mobile Studio](https://builder-project-2045e575-af73-492b-b3bf-b5725693a889.fly.dev/mobile-studio) - Mobile-optimized streaming

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Modern web browser (Chrome recommended)
- HTTPS connection (required for camera access)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/streamfusion.git
cd streamfusion

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:5173
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Platform API Keys (Optional - Demo mode works without these)
VITE_YOUTUBE_CLIENT_ID=your-youtube-client-id
VITE_TWITCH_CLIENT_ID=your-twitch-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
VITE_TWITTER_CLIENT_ID=your-twitter-client-id

# Backend Services (Optional - Demo mode available)
VITE_RTMP_SERVER_URL=wss://your-rtmp-server.com
VITE_SIGNALING_SERVER_URL=wss://your-signaling-server.com
VITE_CHAT_SERVER_URL=wss://your-chat-server.com
```

**Note**: The application works in demo mode without any API keys. All features are fully functional with simulated data.

## 📱 Usage

### 1. Basic Streaming

1. Visit the [Studio](https://builder-project-2045e575-af73-492b-b3bf-b5725693a889.fly.dev/studio)
2. Allow camera and microphone permissions
3. Configure your stream settings
4. Click "Go Live" to start streaming

### 2. Multi-Platform Setup

1. Go to Platform Manager
2. Connect your accounts (YouTube, Twitch, Facebook, X)
3. Enable platforms you want to stream to
4. Start streaming to all platforms simultaneously

### 3. Adding Guests

1. Open Guest Manager
2. Send invitation links to guests
3. Guests join via WebRTC connection
4. Manage guest audio/video controls

### 4. Stream Overlays

1. Navigate to Overlays tab
2. Choose from presets or create custom overlays
3. Drag and drop to position overlays
4. Customize styling and visibility

## 🏗️ Architecture

### Frontend Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Zustand** - Lightweight state management

### Core Technologies

- **WebRTC** - Real-time communication for guests
- **MediaRecorder API** - Local recording capabilities
- **Canvas API** - Video composition and overlays
- **WebSocket** - Real-time chat and signaling
- **Progressive Web App** - Native app experience

### Project Structure

```
streamfusion/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── streaming/      # Streaming-specific components
│   │   └── advanced/       # Advanced feature components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and business logic
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── pages/              # Main application pages
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🎨 Features Deep Dive

### Stream Overlays System

- **Drag-and-Drop Editor**: Visual overlay positioning
- **Professional Presets**: 8+ ready-to-use overlay templates
- **Real-Time Preview**: See changes instantly
- **Advanced Styling**: Custom fonts, colors, shadows, and effects

### Advanced Video Capture

- **Multi-View Support**: Camera, screen share, picture-in-picture
- **Guest Video Management**: Multiple guest streams with individual controls
- **Automatic Fallbacks**: Smart resolution and quality adjustments
- **Permission Recovery**: Comprehensive camera troubleshooting

### Analytics Dashboard

- **Real-Time Metrics**: Live viewer counts and engagement
- **Platform Breakdown**: Analytics per streaming platform
- **Historical Data**: Stream performance over time
- **Export Options**: Download analytics reports

### Mobile Optimization

- **Touch Controls**: Optimized for mobile streaming
- **Responsive Design**: Works on all screen sizes
- **Mobile-First Features**: Simplified interface for mobile users
- **Progressive Enhancement**: Advanced features on desktop

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript checks
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new features
- Update documentation for API changes
- Ensure mobile responsiveness

## 🚀 Deployment

### Recommended Platforms

- **Vercel** - Optimal for React applications
- **Netlify** - Great for static deployments
- **AWS Amplify** - Full-stack hosting
- **Railway** - Simple deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Set the following environment variables in your hosting platform:

- `VITE_YOUTUBE_CLIENT_ID`
- `VITE_TWITCH_CLIENT_ID`
- `VITE_FACEBOOK_APP_ID`
- `VITE_TWITTER_CLIENT_ID`

## 📚 API Documentation

### Core Hooks

- `useWebRTC()` - WebRTC functionality and guest management
- `useRealStream()` - Multi-platform streaming logic
- `useChat()` - Real-time chat integration
- `useScreenShare()` - Screen sharing capabilities

### Services

- `rtmpService` - RTMP streaming implementation
- `webrtcService` - WebRTC peer connections
- `chatService` - Multi-platform chat aggregation
- `authService` - Platform authentication

## 🐛 Troubleshooting

### Common Issues

#### Camera Permission Denied

- Check browser permissions in address bar
- Ensure HTTPS connection
- Try different browser (Chrome recommended)
- Use the built-in permission fixer tool

#### No Audio/Video from Guests

- Verify WebRTC is supported
- Check firewall settings
- Ensure guests allow camera/microphone access
- Use STUN/TURN servers for NAT traversal

#### Streaming Connection Failed

- Verify API keys are correctly configured
- Check platform authentication status
- Ensure RTMP server is accessible
- Use demo mode for testing

### Getting Help

- Check the [Troubleshooting Guide](docs/troubleshooting.md)
- Open an [Issue](https://github.com/yourusername/streamfusion/issues)
- Join our [Discord Community](https://discord.gg/streamfusion)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WebRTC Team** for excellent real-time communication APIs
- **Shadcn** for the beautiful UI component library
- **Vercel** for hosting the demo
- **Open Source Community** for inspiration and contributions

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/streamfusion&type=Date)](https://star-history.com/#yourusername/streamfusion&Date)

---

<div align="center">

**Built with ❤️ by the StreamFusion Team**

[Website](https://streamfusion.dev) • [Documentation](https://docs.streamfusion.dev) • [Discord](https://discord.gg/streamfusion) • [Twitter](https://twitter.com/streamfusion)

</div>
