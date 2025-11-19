/**
 * Authentication Context
 * Provides user authentication state and methods throughout the app
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  subscriptionTier: string;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  totalSessions: number;
  totalBreaks: number;
  dailyGoalScore: number;
  weeklyGoalScore: number;
  workEnvironment?: string;
  dailySittingHours?: number;
  painAreas?: string[];
  workSchedule?: any;
  userGoals?: any;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('authToken');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          setToken(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('authToken');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');
    sessionStorage.removeItem('authSuccess');
    setToken(null);
    setUser(null);
    router.push('/auth');
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
