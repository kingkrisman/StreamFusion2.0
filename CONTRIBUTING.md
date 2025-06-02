# Contributing to StreamFusion

Thank you for your interest in contributing to StreamFusion! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Git
- Modern web browser (Chrome recommended for testing)

### Development Setup

1. **Fork the repository**

   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/streamfusion.git
   cd streamfusion
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration (optional for demo mode)
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm run test
   npm run typecheck
   ```

## 📋 Development Guidelines

### Code Standards

#### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` types - use proper typing
- Export types from `src/types/` directory

#### React

- Use functional components with hooks
- Follow React best practices
- Use proper prop types and interfaces
- Implement error boundaries for new features

#### Styling

- Use Tailwind CSS for styling
- Follow component-based styling approach
- Use Shadcn/ui components when possible
- Ensure responsive design (mobile-first)

#### Code Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── streaming/       # Streaming-specific components
│   └── advanced/        # Advanced feature components
├── hooks/               # Custom React hooks
├── services/            # Business logic and API calls
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── pages/               # Page components
```

### Naming Conventions

- **Components**: PascalCase (`VideoCapture.tsx`)
- **Hooks**: camelCase with `use` prefix (`useWebRTC.ts`)
- **Services**: camelCase (`rtmpService.ts`)
- **Types**: PascalCase (`StreamOverlay`)
- **Files**: kebab-case for non-components (`stream-utils.ts`)

### Git Workflow

#### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation updates

#### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

Examples:

```bash
feat(streaming): add multi-platform RTMP support
fix(camera): resolve permission handling on Safari
docs(readme): update installation instructions
```

## 🎯 Areas for Contribution

### 🔥 High Priority

- **Browser Compatibility**: Testing and fixes for Firefox, Safari, Edge
- **Mobile Experience**: Touch controls and mobile-specific features
- **Performance**: Optimize video processing and memory usage
- **Accessibility**: Screen reader support and keyboard navigation

### 🚀 New Features

- **Platform Integrations**: Additional streaming platforms
- **Advanced Overlays**: Animation and effects system
- **Team Collaboration**: Multi-user streaming management
- **Analytics**: Enhanced metrics and reporting

### 🐛 Bug Fixes

- Camera/microphone permission issues
- WebRTC connection stability
- Stream overlay positioning bugs
- Cross-browser compatibility issues

### 📚 Documentation

- API documentation improvements
- Tutorial creation
- Code examples and demos
- Translation to other languages

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# TypeScript checks
npm run typecheck

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Testing Guidelines

- Write tests for new features
- Maintain >80% code coverage
- Test critical user flows (camera permission, streaming, guest management)
- Include browser compatibility tests

### Manual Testing Checklist

- [ ] Camera and microphone permissions work
- [ ] Video capture displays correctly
- [ ] Screen sharing functions properly
- [ ] Guest connections establish successfully
- [ ] Overlays render and position correctly
- [ ] Mobile interface is responsive
- [ ] Error states are handled gracefully

## 📝 Pull Request Process

### Before Submitting

1. **Update documentation** if adding new features
2. **Run all tests** and ensure they pass
3. **Test manually** on different browsers
4. **Update CHANGELOG.md** if applicable
5. **Squash commits** if you have multiple small commits

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Screenshots (if applicable)

Add screenshots for UI changes

## Additional Notes

Any additional information for reviewers
```

### Review Process

1. **Automated checks** must pass (CI/CD, tests, linting)
2. **Code review** by maintainers
3. **Manual testing** by reviewers
4. **Approval** from at least one maintainer
5. **Merge** to develop branch

## 🐛 Bug Reports

### Before Reporting

1. Check if the issue already exists
2. Test on the latest version
3. Try in different browsers
4. Check browser console for errors

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**

1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**

- Browser: [e.g. Chrome 91]
- OS: [e.g. macOS Big Sur]
- Device: [e.g. MacBook Pro, iPhone 12]

**Screenshots/Console Logs**
Add screenshots and console errors
```

## 💡 Feature Requests

### Guidelines

- **Search existing issues** first
- **Provide clear use case** and motivation
- **Consider implementation complexity**
- **Think about user experience** impact

### Feature Request Template

```markdown
**Feature Description**
Clear description of the requested feature

**Use Case**
Why this feature would be valuable

**Proposed Solution**
How you envision this working

**Alternatives Considered**
Other solutions you've thought about

**Additional Context**
Any other relevant information
```

## 📋 Code Review Guidelines

### For Contributors

- **Keep PRs focused** - one feature/fix per PR
- **Write clear descriptions** of changes
- **Respond promptly** to review feedback
- **Test thoroughly** before requesting review

### For Reviewers

- **Be constructive** and helpful
- **Focus on code quality** and maintainability
- **Test manually** when possible
- **Approve promptly** when ready

## 🏆 Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** file
- **Release notes** for significant contributions
- **GitHub contributors** section
- **Social media** shoutouts for major features

## 📞 Getting Help

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Discord** - Real-time chat with the community
- **Email** - Direct contact for sensitive issues

### Development Questions

- Check existing **GitHub Issues** and **Discussions**
- Join our **Discord server** for quick help
- Review the **documentation** and **code comments**
- Look at **existing implementations** for patterns

## 📄 License

By contributing to StreamFusion, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to StreamFusion! Your help makes this project better for everyone. 🎉
