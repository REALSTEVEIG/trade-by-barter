'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { User, LoginCredentials, SignupData } from '@/types';

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

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const router = useRouter();
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on mount
  React.useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Verify token and get user data
      const response = await authApi.getProfile();
      setState(prev => ({
        ...prev,
        user: (response as any),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
    }
  };

  const login = React.useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = (response as any);

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Redirect to feed page after successful login
      router.push('/feed');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [router]);

  const signup = React.useCallback(async (data: SignupData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authApi.signup(data);
      const { user, accessToken, refreshToken } = (response as any);

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Redirect to feed page after successful signup
      router.push('/feed');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [router]);

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Call logout API
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state and tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Redirect to home page
      router.push('/');
    }
  }, [router]);

  const refreshUser = React.useCallback(async (): Promise<void> => {
    try {
      const response = await authApi.getProfile();
      setState(prev => ({
        ...prev,
        user: (response as any),
        error: null,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to refresh user data.';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const clearError = React.useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = React.useMemo(() => ({
    ...state,
    login,
    signup,
    logout,
    refreshUser,
    clearError,
  }), [state, login, signup, logout, refreshUser, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  const WithAuthComponent = (props: P): React.ReactElement => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-neutral-gray">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <div>Redirecting...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithAuthComponent;
}

export default AuthProvider;