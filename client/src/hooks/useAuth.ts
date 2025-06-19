import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  userType: 'client' | 'provider';
  isVerified: boolean;
  phoneVerified: boolean;
  phone?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('useAuth: Checking authentication...');
    console.log('useAuth: Token exists:', !!token);
    console.log('useAuth: User data exists:', !!userData);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('useAuth: Parsed user data:', user);
        console.log('useAuth: User type from localStorage:', user.userType);
        
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.log('useAuth: Error parsing user data, clearing localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } else {
      console.log('useAuth: No token or user data found');
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
}