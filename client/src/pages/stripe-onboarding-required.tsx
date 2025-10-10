import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, CreditCard, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function StripeOnboardingRequired() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Verificar se já tem Stripe conectado ao carregar a página
  useEffect(() => {
    checkIfAlreadyConnected();
  }, []);

  const checkIfAlreadyConnected = async () => {
    try {
      const response = await fetch('/api/stripe/connect/account-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Se já está conectado e ativo, redirecionar para dashboard
        if (data.connected && data.chargesEnabled) {
          toast({
            title: "✅ Stripe já configurado!",
            description: "Redirecionando para o dashboard...",
          });
          setTimeout(() => {
            setLocation('/provider-dashboard');
          }, 1500);
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao conectar Stripe');
      }

      const data = await response.json();
      
      // Redirecionar para onboarding do Stripe
      window.location.href = data.onboardingUrl;
    } catch (err) {
      console.error('Erro ao conectar Stripe:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : 'Erro ao conectar Stripe',
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verificando configuração...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center">
            <CreditCard className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Configure Sua Conta de Pagamentos
          </CardTitle>
          <CardDescription className="text-base">
            Para começar a receber propostas e pagamentos, você precisa conectar sua conta Stripe
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Por que é necessário */}
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Por que isso é necessário?</strong>
              <p className="text-sm mt-2">
                Para garantir que você receba seus pagamentos de forma rápida e segura, 
                usamos o Stripe - a mesma plataforma usada por empresas como Uber e Airbnb.
              </p>
            </AlertDescription>
          </Alert>

          {/* Benefícios */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">O que você ganha:</h3>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Pagamentos Automáticos</p>
                <p className="text-sm text-gray-600">
                  Receba o dinheiro direto na sua conta assim que o serviço for concluído
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Seguro e Confiável</p>
                <p className="text-sm text-gray-600">
                  Seus dados bancários são protegidos com criptografia de nível bancário
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Rápido e Fácil</p>
                <p className="text-sm text-gray-600">
                  Leva apenas 3-5 minutos para configurar
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Comece a Ganhar Hoje</p>
                <p className="text-sm text-gray-600">
                  Após configurar, você já pode receber propostas e pagamentos
                </p>
              </div>
            </div>
          </div>

          {/* Informações necessárias */}
          <Alert>
            <AlertDescription>
              <strong>Você vai precisar ter em mãos:</strong>
              <ul className="text-sm mt-2 space-y-1 ml-4 list-disc">
                <li>CPF</li>
                <li>Data de nascimento</li>
                <li>Endereço completo</li>
                <li>Dados bancários (banco, agência, conta)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Botão principal */}
          <Button
            onClick={handleConnectStripe}
            disabled={loading}
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Conectando ao Stripe...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Conectar Stripe Agora
              </>
            )}
          </Button>

          {/* Informação adicional */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Ao conectar, você será redirecionado para o site seguro do Stripe.<br />
              Seus dados estão protegidos e não são compartilhados com o LifeBee.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

