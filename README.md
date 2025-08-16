# PentryPal

A React Native cross-platform mobile application for collaborative grocery and pantry management with real-time collaboration, offline functionality, and comprehensive shopping list management.

## Features

- 🛒 Collaborative shopping lists with real-time updates
- 📱 Cross-platform support (iOS & Android)
- 🔄 Offline functionality with automatic sync
- 🏗️ Clean Architecture with TypeScript
- 🎨 Atomic Design component system
- 🔐 Secure authentication and data encryption
- 📊 Analytics and performance monitoring
- 🌍 Internationalization support
- ♿ Accessibility compliance

## Architecture

This project follows Clean Architecture principles with the following structure:

```
src/
├── presentation/     # UI components, screens, navigation
├── application/      # State management, services, utilities
├── domain/          # Business entities, use cases, interfaces
├── infrastructure/  # External services, APIs, storage
└── shared/          # Common types, constants, utilities
```

## Getting Started

### Prerequisites

- Node.js >= 18
- React Native development environment setup
- iOS: Xcode and CocoaPods
- Android: Android Studio and SDK

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Install iOS dependencies (iOS only):

   ```bash
   cd ios && bundle install && bundle exec pod install && cd ..
   ```

4. Copy environment configuration:

   ```bash
   cp .env.example .env
   ```

5. Update `.env` with your configuration values

### Development

Start the Metro bundler:

```bash
npm start
```

Run on iOS:

```bash
npm run ios
```

Run on Android:

```bash
npm run android
```

### Code Quality

Run linting:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

Format code:

```bash
npm run format
```

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Type checking:

```bash
npm run type-check
```

## Project Structure

### Clean Architecture Layers

- **Presentation Layer**: React Native components, screens, and navigation
- **Application Layer**: State management (Redux), custom hooks, and application services
- **Domain Layer**: Business entities, use cases, and repository interfaces
- **Infrastructure Layer**: External services, API clients, and data persistence

### Key Technologies

- **React Native 0.81** with TypeScript
- **Redux Toolkit** with RTK Query for state management
- **React Navigation v6** for navigation
- **React Native Config** for environment variables
- **ESLint + Prettier** for code quality
- **Husky + lint-staged** for git hooks
- **Jest** for testing

## Development Guidelines

### Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error boundaries
- Follow atomic design principles for components
- Use path aliases for clean imports

### Git Workflow

- Pre-commit hooks run linting and formatting
- Commit messages should be descriptive
- Use feature branches for development
- Ensure all tests pass before merging

## Environment Configuration

The app uses `react-native-config` for environment-specific settings:

- `API_BASE_URL`: Backend API endpoint
- `FIREBASE_*`: Firebase configuration
- `ENABLE_*`: Feature flags for development tools

## Contributing

1. Follow the established architecture patterns
2. Write tests for new functionality
3. Update documentation as needed
4. Ensure code passes all quality checks

## License

This project is private and proprietary.
