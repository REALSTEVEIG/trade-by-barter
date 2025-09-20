import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/lib/api';
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
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      console.log('Login response:', response);

      // Handle different possible response structures
      let user: User;
      let accessToken: string;
      let refreshToken: string;

      // The API client wraps the response in { success: boolean, data: AuthResponse }
      // The backend returns raw AuthResponse for successful requests
      const authData = response.data as any;
      
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
    } catch (error: any) {
      console.error('Login error:', error);
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
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      console.log('Signup response:', response);

      // Handle different possible response structures
      let user: User;
      let accessToken: string;
      let refreshToken: string;

      // The API client wraps the response in { success: boolean, data: AuthResponse }
      // The backend returns raw AuthResponse for successful requests
      const authData = response.data as any;
      
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
    } catch (error: any) {
      console.error('Signup error:', error);
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
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state and tokens
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      
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
      const user = response.data as User;
      
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