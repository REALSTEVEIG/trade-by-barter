import { Platform } from 'react-native';

// Network configuration for different environments
const getBaseURL = (): string => {
  // For now, use simple environment detection without expo-constants to avoid TurboModule issues
  // In production, you can set this via app config or build-time environment variables
  
  // Development environment with platform-specific handling
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host localhost
    return 'http://10.0.2.2:4000/api/v1';
  }
  
  // iOS simulator and physical devices can use localhost
  return 'http://localhost:4000/api/v1';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  
  // WebSocket URL for real-time features
  WS_URL: getBaseURL().replace('http', 'ws').replace('/api/v1', ''),
  
  // Upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_REQUEST: 5,
};

// Environment detection
export const ENV_INFO = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  platform: Platform.OS,
  
  // Helper to check if running on physical device (simplified to avoid TurboModule issues)
  isPhysicalDevice: () => {
    // For now, assume simulator for development
    // This can be enhanced later with a safer approach
    return false;
  },
};

// Network status messages for debugging
export const getNetworkInfo = (): string => {
  const info = [];
  info.push(`Base URL: ${API_CONFIG.BASE_URL}`);
  info.push(`Platform: ${Platform.OS}`);
  info.push(`Environment: ${__DEV__ ? 'Development' : 'Production'}`);
  info.push(`Device Type: ${ENV_INFO.isPhysicalDevice() ? 'Physical Device' : 'Simulator/Emulator'}`);
  
  return info.join('\n');
};

// Validation function to check if API is reachable
export const validateApiConnection = async (): Promise<{
  success: boolean;
  message: string;
  url: string;
}> => {
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });
    
    const fetchPromise = fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (response.ok) {
      return {
        success: true,
        message: 'API connection successful',
        url: API_CONFIG.BASE_URL,
      };
    } else {
      return {
        success: false,
        message: `API returned status ${response.status}`,
        url: API_CONFIG.BASE_URL,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url: API_CONFIG.BASE_URL,
    };
  }
};

// Export for debugging
if (__DEV__) {
  console.log(' Network Configuration:');
  console.log(getNetworkInfo());
}