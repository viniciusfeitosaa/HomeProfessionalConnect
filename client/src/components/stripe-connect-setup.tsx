import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripeConnectStatus {
  connected: boolean;
  needsOnboarding: boolean;
  accountId?: string;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
}

export function StripeConnectSetup() {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar status ao carregar
  useEffect(() => {
    checkStatus();
    
    // Verificar query params (retorno do Stripe)
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_setup') === 'success') {
      toast({
        title: "✅ Stripe conectado com sucesso!",
        description: "Sua conta foi configurada e você já pode receber pagamentos.",
      });
      // Limpar query params
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => checkStatus(), 2000);
    } else if (params.get('stripe_setup') === 'refresh') {
      toast({
        title: "Link expirado",
        description: "Vamos criar um novo link de configuração para você.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/stripe/connect/account-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      setError('Erro ao carregar informações do Stripe');
      toast({
        title: "Erro",
        description: "Não foi possível carregar o status da conta Stripe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setActionLoading(true);
      setError(null);

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
      console.error('Erro ao iniciar onboarding:', err);
      setError(err instanceof Error ? err.message : 'Erro ao conectar Stripe');
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : 'Erro ao conectar Stripe',
        variant: "destructive",
      });
      setActionLoading(false);
    }
  };

  const refreshOnboarding = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/connect/refresh-onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao criar novo link');
      }

      const data = await response.json();
      window.location.href = data.onboardingUrl;
    } catch (err) {
      console.error('Erro ao refresh:', err);
      setError('Erro ao criar novo link de configuração');
      toast({
        title: "Erro",
        description: "Erro ao criar novo link de configuração",
        variant: "destructive",
      });
      setActionLoading(false);
    }
  };

  const openDashboard = async () => {
    try {
      setActionLoading(true);

      const response = await fetch('/api/stripe/connect/dashboard-link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao abrir dashboard');
      }

      const data = await response.json();
      window.open(data.dashboardUrl, '_blank');
    } catch (err) {
      console.error('Erro ao abrir dashboard:', err);
      setError('Erro ao abrir dashboard do Stripe');
      toast({
        title: "Erro",
        description: "Erro ao abrir dashboard do Stripe",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Pagamentos - Stripe</CardTitle>
        <CardDescription>
          Conecte sua conta Stripe para receber pagamentos automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Não conectado */}
        {!status?.connected && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Configure sua conta para receber pagamentos</strong>
              <p className="text-sm mt-2">
                Você precisa conectar uma conta Stripe para poder receber pagamentos 
                dos seus serviços. É rápido, seguro e gratuito!
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Conectado mas precisa completar onboarding */}
        {status?.connected && status?.needsOnboarding && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Complete sua configuração</strong>
              <p className="text-sm mt-2">
                Você começou a configuração mas ainda precisa completar algumas informações.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Totalmente configurado */}
        {status?.connected && !status?.needsOnboarding && status?.chargesEnabled && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✅ Conta Stripe Conectada e Ativa!</strong>
              <p className="text-sm mt-2">
                Sua conta está configurada e você pode receber pagamentos. 
                Os valores serão depositados automaticamente em sua conta.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Status detalhado */}
        {status?.connected && (
          <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
            <h4 className="font-medium mb-3">Status da Conta:</h4>
            
            <div className="flex items-center gap-2 text-sm">
              {status.detailsSubmitted ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Informações enviadas</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {status.chargesEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Pode receber pagamentos</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {status.payoutsEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Pode fazer saques</span>
            </div>

            {status.accountId && (
              <div className="text-xs text-gray-500 mt-3 pt-3 border-t font-mono">
                ID: {status.accountId}
              </div>
            )}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {!status?.connected && (
            <Button 
              onClick={startOnboarding} 
              disabled={actionLoading}
              className="flex-1"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Conectar Stripe'
              )}
            </Button>
          )}

          {status?.connected && status?.needsOnboarding && (
            <Button 
              onClick={refreshOnboarding} 
              disabled={actionLoading}
              className="flex-1"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Completar Configuração'
              )}
            </Button>
          )}

          {status?.connected && status?.chargesEnabled && (
            <Button 
              onClick={openDashboard} 
              disabled={actionLoading}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Dashboard Stripe
            </Button>
          )}

          <Button 
            onClick={checkStatus} 
            disabled={loading}
            variant="outline"
          >
            Atualizar Status
          </Button>
        </div>

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 pt-4 border-t space-y-1">
          <p>• Seus dados são protegidos pelo Stripe</p>
          <p>• Não cobramos taxas adicionais pela conexão</p>
          <p>• Você pode desconectar a qualquer momento</p>
          <p>• Os pagamentos são depositados automaticamente</p>
        </div>
      </CardContent>
    </Card>
  );
}

