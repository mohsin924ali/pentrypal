// ========================================
// Network Provider - Network state management
// ========================================

import React, {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

// Network Context Value
interface NetworkContextValue {
  readonly isConnected: boolean;
  readonly isInternetReachable: boolean;
  readonly type: string | null;
  readonly isLoading: boolean;
  readonly connectionQuality: 'poor' | 'moderate' | 'good' | 'excellent' | 'unknown';
  readonly retryConnection: () => Promise<void>;
}

// Network Context
const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

/**
 * Network Provider Component
 *
 * Provides network state throughout the application
 * Monitors connection status and quality
 */
export const NetworkProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [type, setType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionQuality, setConnectionQuality] =
    useState<NetworkContextValue['connectionQuality']>('unknown');

  // Initialize network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleNetworkStateChange);

    // Get initial state
    NetInfo.fetch().then(handleNetworkStateChange);

    return unsubscribe;
  }, []);

  // Handle network state changes
  const handleNetworkStateChange = React.useCallback((state: NetInfoState) => {
    setIsConnected(state.isConnected ?? false);
    setIsInternetReachable(state.isInternetReachable ?? false);
    setType(state.type);
    setIsLoading(false);

    // Determine connection quality
    const quality = getConnectionQuality(state);
    setConnectionQuality(quality);

    // Log network changes in development
    if (__DEV__) {
      console.log('Network state changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        quality,
      });
    }
  }, []);

  // Determine connection quality based on network state
  const getConnectionQuality = (state: NetInfoState): NetworkContextValue['connectionQuality'] => {
    if (!state.isConnected || !state.isInternetReachable) {
      return 'poor';
    }

    // Check connection details if available
    if (state.details) {
      const details = state.details as any;

      // WiFi connection quality
      if (state.type === 'wifi') {
        const strength = details.strength;
        const frequency = details.frequency;

        if (strength !== undefined) {
          if (strength > 80) return 'excellent';
          if (strength > 60) return 'good';
          if (strength > 40) return 'moderate';
          return 'poor';
        }

        // Frequency-based quality (5GHz is generally better)
        if (frequency && frequency > 5000) {
          return 'good';
        }
      }

      // Cellular connection quality
      if (state.type === 'cellular') {
        const cellularGeneration = details.cellularGeneration;

        switch (cellularGeneration) {
          case '5g':
            return 'excellent';
          case '4g':
          case 'lte':
            return 'good';
          case '3g':
            return 'moderate';
          case '2g':
            return 'poor';
          default:
            return 'moderate';
        }
      }
    }

    // Default based on connection type
    switch (state.type) {
      case 'wifi':
        return 'good';
      case 'cellular':
        return 'moderate';
      case 'ethernet':
        return 'excellent';
      default:
        return 'unknown';
    }
  };

  // Retry connection
  const retryConnection = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const state = await NetInfo.fetch();
      handleNetworkStateChange(state);
    } catch (error) {
      console.warn('Failed to retry connection:', error);
    } finally {
      setIsLoading(false);
    }
  }, [handleNetworkStateChange]);

  const contextValue = React.useMemo(
    (): NetworkContextValue => ({
      isConnected,
      isInternetReachable,
      type,
      isLoading,
      connectionQuality,
      retryConnection,
    }),
    [isConnected, isInternetReachable, type, isLoading, connectionQuality, retryConnection]
  );

  return <NetworkContext.Provider value={contextValue}>{children}</NetworkContext.Provider>;
};

/**
 * Hook to use network context
 * @returns Network context value
 * @throws Error if used outside NetworkProvider
 */
export const useNetwork = (): NetworkContextValue => {
  const context = useContext(NetworkContext);

  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }

  return context;
};

/**
 * Hook to check if device is online
 * @returns Boolean indicating online status
 */
export const useIsOnline = (): boolean => {
  const { isConnected, isInternetReachable } = useNetwork();
  return isConnected && isInternetReachable;
};

/**
 * Hook to get connection quality
 * @returns Connection quality indicator
 */
export const useConnectionQuality = (): NetworkContextValue['connectionQuality'] => {
  const { connectionQuality } = useNetwork();
  return connectionQuality;
};

/**
 * Hook to handle network-dependent operations
 * @param onOnline - Callback when network comes online
 * @param onOffline - Callback when network goes offline
 */
export const useNetworkEffect = (onOnline?: () => void, onOffline?: () => void): void => {
  const { isConnected, isInternetReachable } = useNetwork();
  const wasOnlineRef = React.useRef(isConnected && isInternetReachable);

  React.useEffect(() => {
    const isOnline = isConnected && isInternetReachable;
    const wasOnline = wasOnlineRef.current;

    if (isOnline && !wasOnline) {
      // Just came online
      onOnline?.();
    } else if (!isOnline && wasOnline) {
      // Just went offline
      onOffline?.();
    }

    wasOnlineRef.current = isOnline;
  }, [isConnected, isInternetReachable, onOnline, onOffline]);
};
