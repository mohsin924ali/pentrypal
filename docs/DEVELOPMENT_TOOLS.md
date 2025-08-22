# Development Tools Guide

This document provides an overview of the development and debugging tools available in the PentryPal React Native application.

## Overview

The development tools are designed to enhance the developer experience by providing:
- Advanced debugging capabilities with Flipper integration
- React DevTools and performance monitoring
- Hot reloading and fast refresh optimization
- Bundle analysis and optimization tools
- Comprehensive development scripts

## Tools Available

### 1. Flipper Integration

Flipper provides advanced debugging capabilities including:
- Network request inspection
- Redux state monitoring
- Performance profiling
- Custom logging

**Usage:**
```bash
# Start Flipper server
npm run flipper

# The app will automatically connect when running in debug mode
npm run android:debug
npm run ios:debug
```

### 2. React DevTools

React DevTools integration for component inspection and profiling.

**Usage:**
```bash
# Start React DevTools
npm run devtools

# Connect to running app for component inspection
```

### 3. Performance Monitoring

Built-in performance monitoring tracks:
- Component render times
- Navigation performance
- Memory usage
- Bundle size analysis

**Features:**
- Automatic slow render detection (>16ms)
- Memory usage alerts
- Performance metrics collection
- Development menu integration

### 4. Bundle Analyzer

Analyze bundle size and identify optimization opportunities.

**Usage:**
```bash
# Analyze bundle composition
npm run bundle:analyze

# Generate bundle reports
npm run bundle:android
npm run bundle:ios
```

### 5. Hot Reloading & Fast Refresh

Optimized hot reloading configuration for faster development cycles.

**Features:**
- Enhanced Metro configuration
- Fast Refresh boundary helpers
- Automatic cache management
- Development shortcuts

## Development Scripts

### Build & Run Scripts
```bash
# Android
npm run android              # Run on Android emulator
npm run android:debug        # Debug build
npm run android:release      # Release build

# iOS  
npm run ios                  # Run on iOS simulator
npm run ios:debug           # Debug build
npm run ios:release         # Release build
npm run ios:device          # Run on physical device
```

### Development Server
```bash
npm start                   # Start Metro bundler
npm run start:reset         # Start with cache reset
npm run start:verbose       # Start with verbose logging
```

### Cleaning & Maintenance
```bash
npm run clean              # Clean React Native cache
npm run clean:android      # Clean Android build
npm run clean:ios          # Clean iOS build
npm run clean:metro        # Clean Metro cache
npm run clean:all          # Clean everything
```

### Code Quality
```bash
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run lint:watch         # Watch mode linting
npm run format             # Format code with Prettier
npm run format:check       # Check formatting
npm run type-check         # TypeScript type checking
npm run type-check:watch   # Watch mode type checking
```

### Testing
```bash
npm test                   # Run tests
npm run test:watch         # Watch mode testing
npm run test:coverage      # Generate coverage report
npm run test:ci            # CI mode testing
npm run test:debug         # Debug test issues
```

### Debugging
```bash
npm run debug:network      # Monitor network requests
npm run debug:performance  # Monitor performance
npm run dev:menu           # Open development menu
npm run dev:reload         # Reload app
npm run dev:debug-js       # Open JS debugger
```

## Development Menu

Access the development menu by:
- **Android**: Shake device or press `Ctrl+M` (emulator) or run `npm run dev:menu`
- **iOS**: Shake device or press `Cmd+D` (simulator)

### Available Options:
- **Toggle Performance Monitor**: Show/hide performance overlay
- **Clear AsyncStorage**: Clear local storage
- **Log Performance Report**: Display performance metrics
- **Analyze Bundle Size**: Show bundle analysis
- **Show Debug Logs**: Display categorized logs
- **Memory Usage**: Check current memory consumption

## Configuration

### Environment Variables

Configure development tools via `.env` file:

```bash
# Development Tools
ENABLE_FLIPPER=true
ENABLE_DEV_TOOLS=true
ENABLE_PERFORMANCE_MONITORING=true
LOG_LEVEL=debug

# Features
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
```

### Metro Configuration

The Metro bundler is configured for optimal development experience:
- Path aliases for clean imports
- Enhanced caching for faster rebuilds
- Hot reloading optimization
- Bundle size optimization

## Debugging Categories

The debug utilities provide categorized logging:

```typescript
import { debugUtils } from '@/infrastructure/config/debugUtils';

// Navigation debugging
debugUtils.debugNavigation('Screen changed', { from: 'Home', to: 'Profile' });

// Redux state debugging
debugUtils.debugRedux('Action dispatched', { type: 'USER_LOGIN', payload: userData });

// API debugging
debugUtils.debugAPI('Request sent', { url: '/api/users', method: 'GET' });

// Performance debugging
debugUtils.debugPerformance('Component rendered', { component: 'UserList', time: '12ms' });

// Authentication debugging
debugUtils.debugAuth('Login attempt', { email: 'user@example.com' });
```

## Performance Monitoring

### Component Performance
```typescript
import { usePerformanceTracker } from '@/infrastructure/config/devtools';

const MyComponent = () => {
  const trackRender = usePerformanceTracker('MyComponent');
  
  useEffect(() => {
    trackRender(); // Automatically tracks render time
  });
  
  return <View>...</View>;
};
```

### Navigation Performance
```typescript
import { trackNavigationPerformance } from '@/infrastructure/config/devtools';

const navigateToScreen = (screenName: string) => {
  const trackNavigation = trackNavigationPerformance(screenName);
  
  navigation.navigate(screenName);
  
  // Track when navigation completes
  setTimeout(trackNavigation, 0);
};
```

## Bundle Analysis

### Analyzing Bundle Size
The bundle analyzer provides insights into:
- Total bundle size breakdown
- Largest modules identification
- Duplicate module detection
- Optimization recommendations

### Tracking Bundle Growth
Bundle size is automatically tracked over time to identify:
- Size regression trends
- Module growth patterns
- Optimization opportunities

## Best Practices

### 1. Use Development Tools Effectively
- Enable Flipper for network and state debugging
- Use React DevTools for component optimization
- Monitor performance metrics regularly
- Analyze bundle size before releases

### 2. Debugging Workflow
- Use categorized logging for better organization
- Track performance metrics during development
- Clear caches when experiencing issues
- Use development menu shortcuts for quick access

### 3. Performance Optimization
- Monitor component render times
- Track navigation performance
- Analyze memory usage patterns
- Optimize bundle size regularly

### 4. Code Quality
- Run linting and formatting before commits
- Use type checking in watch mode
- Maintain test coverage
- Clean build artifacts regularly

## Troubleshooting

### Common Issues

**Metro bundler not starting:**
```bash
npm run clean:metro
npm run start:reset
```

**Flipper not connecting:**
- Ensure Flipper desktop app is running
- Check that `ENABLE_FLIPPER=true` in `.env`
- Restart the app in debug mode

**Performance issues:**
```bash
npm run debug:performance
npm run bundle:analyze
```

**Build failures:**
```bash
npm run clean:all
npm install
```

### Debug Information

Access comprehensive debug information through:
- Development menu options
- Console logging with categories
- Performance reports
- Bundle analysis reports

## Integration with CI/CD

The development tools integrate with CI/CD pipelines:
- Automated testing with coverage reports
- Bundle size tracking and alerts
- Performance regression detection
- Code quality enforcement

For more information on specific tools, refer to their individual documentation files.