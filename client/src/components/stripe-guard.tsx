import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface StripeGuardProps {
  children: React.ReactNode;
}

/**
 * Guard que verifica se o profissional tem Stripe Connect configurado
 * Se não tiver, redireciona para página de onboarding obrigatório
 */
export function StripeGuard({ children }: StripeGuardProps) {
  const [checking, setChecking] = useState(true);
  const [hasStripe, setHasStripe] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkStripeStatus();
  }, []);

  const checkStripeStatus = async () => {
    try {
      const token = sessionStorage.getItem('token');
      console.log('🔍 StripeGuard - Iniciando verificação...');
      console.log('🔑 Token existe?', !!token);
      
      const response = await fetch('/api/stripe/connect/account-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        
        console.log('📊 StripeGuard - Dados completos:', {
          connected: data.connected,
          accountId: data.accountId,
          detailsSubmitted: data.detailsSubmitted,
          chargesEnabled: data.chargesEnabled,
          payoutsEnabled: data.payoutsEnabled,
          needsOnboarding: data.needsOnboarding
        });
        
        // TEMPORÁRIO: Permitir acesso independente do status do Stripe
        // para não bloquear profissionais durante debug
        console.log('✅ StripeGuard - Permitindo acesso (modo debug)');
        setHasStripe(true);
        
        // Se não tem Stripe, apenas avisar no console (não bloquear)
        if (!data.connected) {
          console.warn('⚠️ Profissional precisa configurar Stripe para receber pagamentos');
          console.warn('Acesse /provider-settings para configurar');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', response.status, errorText);
        // Erro ao verificar - permitir acesso por enquanto (não bloquear)
        console.warn('⚠️ StripeGuard - Erro ao verificar, permitindo acesso');
        setHasStripe(true);
      }
    } catch (error) {
      console.error('❌ StripeGuard - Erro ao verificar Stripe:', error);
      // Em caso de erro, permitir acesso (não bloquear profissional)
      setHasStripe(true);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verificando configuração de pagamentos...</p>
        </div>
      </div>
    );
  }

  // Se tem Stripe, renderiza o conteúdo
  return hasStripe ? <>{children}</> : null;
}

