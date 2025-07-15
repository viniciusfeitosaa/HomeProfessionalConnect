import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api-config';

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
    const verifyToken = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
          // Verify token with backend
          const response = await fetch(`${getApiUrl()}/api/user`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });
          
          if (response.ok) {
            const user = await response.json();
            setAuthState({
              user,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          // Fallback to stored user data if network error
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
          } catch (parseError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
          }
      }
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
    };

    verifyToken();
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