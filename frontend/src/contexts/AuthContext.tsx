import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PocketBase from 'pocketbase';
import { User } from '../types';

interface AuthContextType {
  pb: PocketBase;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [pb] = useState(() => new PocketBase(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8090'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if there's a valid auth token in localStorage
        if (pb.authStore.isValid) {
          // Refresh the auth to ensure it's still valid
          await pb.collection('users').authRefresh();
          setUser(pb.authStore.model as User);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        pb.authStore.clear();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [pb]);

  // Listen to auth changes
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model as User | null);
    });

    return unsubscribe;
  }, [pb]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const authData = await pb.collection('users').authWithPassword(email, password);
      setUser(authData.record as User);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [pb]);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      setIsLoading(true);
      
      // Create new user
      const userData = {
        email,
        password,
        passwordConfirm: password,
        display_name: displayName || email.split('@')[0],
        theme: 'system',
      };

      const createdUser = await pb.collection('users').create(userData);
      
      // Auto-login after registration
      await login(email, password);
      
      return createdUser;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }, [pb, login]);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
  }, [pb]);

  const refreshAuth = useCallback(async () => {
    try {
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh();
        setUser(pb.authStore.model as User);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      logout();
    }
  }, [pb, logout]);

  const value = {
    pb,
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};