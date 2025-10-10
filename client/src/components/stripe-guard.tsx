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
      const response = await fetch('/api/stripe/connect/account-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Verificar se está conectado E pode receber pagamentos
        if (data.connected && data.chargesEnabled) {
          setHasStripe(true);
        } else {
          // Redirecionar para página de setup
          console.log('⚠️ Profissional sem Stripe - redirecionando...');
          setLocation('/stripe-setup');
        }
      } else {
        // Erro ao verificar - redireciona para setup por segurança
        setLocation('/stripe-setup');
      }
    } catch (error) {
      console.error('Erro ao verificar Stripe:', error);
      // Em caso de erro, redireciona para setup
      setLocation('/stripe-setup');
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

