import Config from 'react-native-config';

export interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  authProvider: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  enableFlipper: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  nodeEnv: string;
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = {
      apiBaseUrl: Config.API_BASE_URL || 'https://api.pentrypal.com',
      apiTimeout: parseInt(Config.API_TIMEOUT || '10000', 10),
      authProvider: Config.AUTH_PROVIDER || 'firebase',
      firebaseApiKey: Config.FIREBASE_API_KEY || '',
      firebaseAuthDomain: Config.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: Config.FIREBASE_PROJECT_ID || '',
      enableFlipper: Config.ENABLE_FLIPPER === 'true',
      enableAnalytics: Config.ENABLE_ANALYTICS === 'true',
      enableCrashReporting: Config.ENABLE_CRASH_REPORTING === 'true',
      nodeEnv: Config.NODE_ENV || 'development',
    };
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }
}

export const configService = ConfigService.getInstance();
export default configService;
