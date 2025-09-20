import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/lib/api';
import socketService from '@/lib/socket';
import { User, LoginCredentials, SignupData } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Verify token and get user data
      const response = await authApi.getProfile();
      setState(prev => ({
        ...prev,
        user: response.data as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Initialize socket connection with authentication if user is authenticated
      try {
        socketService.connect();
      } catch (socketError) {
        // Don't fail initialization if socket connection fails
      }
    } catch (error) {
      // Token is invalid, clear it
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authApi.login(credentials);
      
      // Defensive check for response structure
      if (!response) {
        throw new Error('Invalid response from server');
      }

      // The backend returns AuthResponse directly, not wrapped
      let user: User;
      let accessToken: string;
      let refreshToken: string;

      // Check if response has the auth data directly or wrapped in data
      const authData = response.data ? response.data : response as any;
      
      if (!authData || !authData.user || !authData.accessToken || !authData.refreshToken) {
        throw new Error('Missing authentication data in response');
      }

      user = authData.user;
      accessToken = authData.accessToken;
      refreshToken = authData.refreshToken;

      // Store tokens and user data
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
      ]);

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Initialize socket connection with authentication
      try {
        socketService.connect();
      } catch (socketError) {
        // Don't fail login if socket connection fails
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your internet connection and ensure the backend is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const signup = async (data: SignupData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authApi.signup(data);
      
      // Defensive check for response structure
      if (!response) {
        throw new Error('Invalid response from server');
      }

      // The backend returns AuthResponse directly, not wrapped
      let user: User;
      let accessToken: string;
      let refreshToken: string;

      // Check if response has the auth data directly or wrapped in data
      const authData = response.data ? response.data : response as any;
      
      if (!authData || !authData.user || !authData.accessToken || !authData.refreshToken) {
        throw new Error('Missing authentication data in response');
      }

      user = authData.user;
      accessToken = authData.accessToken;
      refreshToken = authData.refreshToken;

      // Store tokens and user data
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
      ]);

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Initialize socket connection with authentication
      try {
        socketService.connect();
      } catch (socketError) {
        // Don't fail signup if socket connection fails
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Call logout API
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear local state and tokens
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      
      // Disconnect socket
      try {
        socketService.disconnect();
      } catch (socketError) {
        // Ignore socket disconnect errors
      }
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authApi.getProfile();
      const user = response.data ? response.data as User : (response as any);
      
      // Update stored user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      setState(prev => ({
        ...prev,
        user,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to refresh user data.';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;