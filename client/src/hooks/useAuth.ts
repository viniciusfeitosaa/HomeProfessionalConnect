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
    console.log('🔐 useAuth: Verificando token...');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔐 useAuth: Token presente:', !!token);
    console.log('🔐 useAuth: UserData presente:', !!userData);
    
    if (token && userData) {
        try {
          console.log('🔐 useAuth: Verificando token com backend...');
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
            console.log('🔐 useAuth: Usuário verificado com sucesso:', user);
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
          console.log('🔐 useAuth: Usando fallback com dados armazenados...');
          // Fallback to stored user data if network error
      try {
        const user = JSON.parse(userData);
        console.log('🔐 useAuth: Usuário carregado do localStorage:', user);
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