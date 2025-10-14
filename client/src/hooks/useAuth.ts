import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api-config';
import { getAuthToken, setAuthToken, removeAuthToken, getAuthUser, setAuthUser, clearAuth } from '@/lib/auth-storage';

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
    
    // Migrar de localStorage para sessionStorage se necessário
    const localToken = localStorage.getItem('token');
    const localUser = localStorage.getItem('user');
    if (localToken && !getAuthToken()) {
      console.log('📦 Migrando token de localStorage para sessionStorage...');
      setAuthToken(localToken);
      if (localUser) setAuthUser(localUser);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    const token = getAuthToken();
    const userData = getAuthUser();
    
    console.log('🔐 useAuth: Token presente:', !!token);
    console.log('🔐 useAuth: UserData presente:', !!userData);
    
    // Validar formato básico do token JWT (deve ter 3 partes separadas por ponto)
    if (token && (!token.includes('.') || token.split('.').length !== 3 || token.length < 50)) {
      console.error('❌ useAuth: Token corrompido detectado! Limpando...');
      console.log('Token length:', token.length);
      clearAuth();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return;
    }
    
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
            console.error('❌ useAuth: Token inválido no backend (status:', response.status, ')');
            // Token is invalid, clear storage
            clearAuth();
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('❌ useAuth: Erro ao verificar token:', error);
          console.log('🔐 useAuth: Limpando dados corrompidos...');
          // Em caso de erro de rede ou token inválido, limpar tudo
          clearAuth();
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
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
    setAuthToken(token);
    setAuthUser(JSON.stringify(user));
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    clearAuth();
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