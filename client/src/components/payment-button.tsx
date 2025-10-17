import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getApiUrl } from '@/lib/api-config';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement
} from '@stripe/react-stripe-js';

// Cache da promise do Stripe para evitar múltiplas chamadas
let cachedStripePromise: Promise<Stripe | null> | null = null;

async function loadStripeFromServer() {
  if (!cachedStripePromise) {
    const response = await fetch(`${getApiUrl()}/api/payment/config`);

    if (!response.ok) {
      throw new Error('Não foi possível obter a configuração do Stripe');
    }

    const data: { publishableKey?: string } = await response.json();

    if (!data.publishableKey) {
      throw new Error('Chave pública do Stripe não configurada no servidor');
    }

    cachedStripePromise = loadStripe(data.publishableKey);
  }

  return cachedStripePromise;
}

interface PaymentButtonProps {
  serviceOfferId: number;
  serviceRequestId: number;
  amount: number;
  serviceName: string;
  professionalName: string;
  onPaymentSuccess?: () => void;
  clientSecret?: string;
}

// Componente interno para processar o pagamento
function PaymentForm({ 
  serviceOfferId,
  amount,
  serviceName,
  professionalName,
  clientSecret,
  onPaymentSuccess
}: PaymentButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const monitorWebhook = async (paymentIntentId: string, retries = 6) => {
    try {
      setIsSyncing(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      for (let attempt = 1; attempt <= retries; attempt++) {
        console.log(`🔄 Verificando status via webhook (tentativa ${attempt}/${retries})`);

        const response = await fetch(`${apiUrl}/api/payment/status/${serviceOfferId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
          }
        });

        const data = await response.json();
        console.log('🔍 Status atual:', data);

        if (response.ok && data.status === 'completed') {
          toast({
            title: "Serviço Concluído!",
            description: "Pagamento aprovado! O serviço está concluído e o profissional foi notificado.",
          });

          setShowDialog(false);
          setTimeout(() => window.location.reload(), 2000);
          setIsSyncing(false);
          setStatusMessage('');
          return;
        }

        if (attempt < retries) {
          setStatusMessage('Pagamento registrado, aguardando confirmação do servidor...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      toast({
        title: "Pagamento Aprovado",
        description: "Pagamento processado, mas o status deve atualizar em instantes. Recarregaremos a página...",
      });

      setShowDialog(false);
      setTimeout(() => window.location.reload(), 4000);
    } catch (error) {
      console.error('❌ Erro ao verificar status via webhook:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Abrir dialog quando clientSecret estiver disponível
  React.useEffect(() => {
    if (clientSecret) {
      setShowDialog(true);
      toast({
        title: "Pagamento Criado",
        description: "Preencha os dados do pagamento para continuar",
      });
    }
  }, [clientSecret, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      console.error('❌ Stripe, Elements ou clientSecret não disponível');
      return;
    }

    console.log('🚀 Iniciando confirmação de pagamento...');
    console.log('🔑 Client Secret:', clientSecret.substring(0, 20) + '...');
    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      console.error('❌ CardElement não encontrado');
      toast({
        title: "Erro",
        description: "Formulário de cartão não carregado",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      console.error('❌ Erro no pagamento:', error);
      console.error('❌ Tipo do erro:', error.type);
      console.error('❌ Código do erro:', error.code);
      console.error('❌ Mensagem do erro:', error.message);
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // ✨ ESCROW: Aceitar status 'requires_capture' (pagamento autorizado/retido)
    const validStatuses = ['succeeded', 'requires_capture'];
    
    if (!paymentIntent || !validStatuses.includes(paymentIntent.status)) {
      console.error('❌ PaymentIntent com status inválido:', paymentIntent);
      console.error('❌ Status recebido:', paymentIntent?.status);
      console.error('❌ Status esperados:', validStatuses);
      toast({
        title: "Erro no Pagamento",
        description: `Status do pagamento: ${paymentIntent?.status || 'desconhecido'}. Tente novamente.`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Log do status para debug
    if (paymentIntent.status === 'requires_capture') {
      console.log('🔒 ESCROW: Pagamento AUTORIZADO (retido) - Status: requires_capture');
    } else {
      console.log('✅ Pagamento capturado - Status: succeeded');
    }

    console.log('✅ Pagamento aprovado:', paymentIntent.id);
    
    console.log('🔍 Verificando token JWT...');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const token = sessionStorage.getItem('token');
    console.log('🔑 Token encontrado no sessionStorage?', !!token);
    console.log('🆕🆕🆕 NOVO CÓDIGO CARREGADO - VERSÃO ATUALIZADA 2025 🆕🆕🆕');
    console.log('🔑 Tipo do token:', typeof token);
    console.log('🔑 Token length:', token?.length);
    
    if (token && token.length > 0) {
      console.log('🔑 Token (primeiros 20 chars):', token.substring(0, 20) + '...');
    } else {
      console.error('❌ Token é null, undefined ou vazio!');
    }

    console.log('✅ Passou da verificação do token');

    if (!token) {
      console.error('❌ Token JWT não encontrado');
      toast({
        title: "Pagamento Aprovado",
        description: "Pagamento realizado, mas o usuário não está autenticado. Faça login novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    console.log('✅ Token válido, iniciando requisição...');

    try {
      const requestBody = {
        serviceOfferId,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
      };

      console.log('');
      console.log('='.repeat(80));
      console.log('🔄 FRONTEND: Enviando requisição para atualizar status...');
      console.log('='.repeat(80));
      console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));
      console.log('🔑 Token presente:', !!token);
      console.log('🌐 API URL:', `${apiUrl}/api/payment/update-status`);
      console.log('📅 Timestamp:', new Date().toISOString());

      const response = await fetch(`${apiUrl}/api/payment/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📊 Response text:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('📊 Response data (parsed):', responseData);
      } catch (e) {
        console.error('❌ Erro ao parsear response como JSON:', e);
        console.error('❌ Response text bruto:', responseText);
      }

      if (response.status === 401) {
        toast({
          title: "Sessão expirada",
          description: "Entre novamente para concluir a atualização do status.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        console.log('✅ FRONTEND: Status atualizado com sucesso!');
        console.log('✅ Response data:', responseData);

        toast({
          title: "Pagamento Autorizado! 🔒",
          description: "Pagamento retido com sucesso! Aguarde o profissional executar o serviço. Você confirmará a conclusão para liberar o pagamento.",
          duration: 5000,
        });

        setShowDialog(false);
        setIsLoading(false);
        
        // Chama callback de sucesso para atualizar estado no componente pai
        if (onPaymentSuccess) {
          console.log('🔄 Chamando onPaymentSuccess callback...');
          onPaymentSuccess();
        }
        
        return;
      } else {
        console.error('❌ FRONTEND: Erro ao atualizar status');
        console.error('❌ Status code:', response.status);
        console.error('❌ Response data:', responseData);
      }

      const errorBody = await response.json().catch(() => null);
      console.error('❌ Erro na atualização imediata:', errorBody || response.statusText);

      toast({
        title: "Pagamento Aprovado",
        description: "Pagamento processado; sincronizando status...",
      });

      monitorWebhook(paymentIntent.id);
    } catch (updateError) {
      console.error('❌ Erro ao atualizar status:', updateError);
      toast({
        title: "Pagamento Aprovado",
        description: "Pagamento processado; sincronizando status...",
      });
      monitorWebhook(paymentIntent.id);
    } finally {
      setIsLoading(false);
    }
  };

  // Stripe Brasil: valor mínimo é R$ 5,00
  const minimumAmount = 5.00;
  const finalAmount = Math.max(amount, minimumAmount);
  const lifebeeCommission = finalAmount * 0.20;
  const professionalAmount = finalAmount - lifebeeCommission;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto mx-auto">
            {/* Header compacto com gradiente */}
            <div className="relative -m-6 mb-3 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-1 text-white text-base font-bold">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Pagamento - R$ {finalAmount.toFixed(2)}</span>
                  </div>
                  {finalAmount > amount && (
                    <span className="text-xs bg-yellow-500 px-2 py-1 rounded self-start sm:self-auto">
                      Mín. R$ 5,00
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-xs">
                  Stripe • Rápido e Seguro
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-3">
              {statusMessage && (
                <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg text-xs text-blue-700">
                  {statusMessage}
                </div>
              )}
              {/* Resumo compacto */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-3 w-3 text-blue-600" />
                  <span className="font-semibold text-blue-900 text-xs">Resumo</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-gray-600">Serviço:</span>
                    <span className="font-medium text-gray-900 max-w-[200px] truncate">{serviceName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-gray-600">Profissional:</span>
                    <span className="font-medium text-gray-900 max-w-[200px] truncate">{professionalName}</span>
                  </div>
                  <div className="border-t pt-1 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-xs">Total:</span>
                      <span className="text-lg font-bold text-blue-600">R$ {finalAmount.toFixed(2)}</span>
                    </div>
                    {finalAmount > amount && (
                      <div className="text-xs text-yellow-600 bg-yellow-50 px-1 py-0.5 rounded mt-1">
                        ⚠️ Mín. R$ 5,00
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs text-gray-500 mt-1">
                      <span>Taxa LifeBee (5%): R$ {lifebeeCommission.toFixed(2)}</span>
                      <span>Profissional: R$ {professionalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

                  {/* Formulário de pagamento */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Método de Pagamento
                      </label>
                      <div className="p-2 border border-gray-300 rounded-md bg-white">
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                  color: '#aab7c4',
                                },
                              },
                              invalid: {
                                color: '#9e2146',
                              },
                            },
                          }}
                          onReady={() => {
                            console.log('✅ CardElement - Pronto!');
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
                        💳 Cartão de Crédito/Débito
                      </p>
                    </div>

                {/* Segurança compacta */}
                <div className="bg-green-50 border border-green-200 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800 text-xs">Pagamento Protegido</p>
                      <p className="text-xs text-green-600">SSL • Criptografia • PCI</p>
                    </div>
                  </div>
                </div>

                {/* Botão de pagamento */}
                <Button
                  type="submit"
                  disabled={!stripe || isLoading}
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {isSyncing ? 'Sincronizando...' : isLoading ? 'Processando...' : `Pagar R$ ${finalAmount.toFixed(2)}`}
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center px-1">
                🔒 Dados seguros e criptografados
              </p>
            </div>
          </DialogContent>
    </Dialog>
  );
}

// Componente principal que envolve com Elements
export default function PaymentButton(props: PaymentButtonProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeLoadError, setStripeLoadError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    console.log('🔄 PaymentButton - Carregando Stripe...');
    setStripePromise(loadStripeFromServer());

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreatePayment = async () => {
    if (!clientSecret && !isLoading) {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${getApiUrl()}/api/payment/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            serviceOfferId: props.serviceOfferId,
            serviceRequestId: props.serviceRequestId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Client Secret recebido:', data.clientSecret?.substring(0, 20) + '...');
        setClientSecret(data.clientSecret);
        toast({
          title: "Pagamento Criado",
          description: "Escolha seu método de pagamento",
        });
      } else {
        // ✨ Tratamento específico para erros de Stripe não configurado
        if (data.errorCode === 'STRIPE_NOT_CONNECTED' || data.errorCode === 'STRIPE_NOT_ENABLED') {
          toast({
            title: "Profissional precisa configurar Stripe",
            description: "O profissional ainda não conectou sua conta Stripe. Por favor, aguarde enquanto ele completa a configuração.",
            variant: "destructive",
          });
          setError('Profissional precisa configurar sua conta Stripe');
          return;
        }
        throw new Error(data.error || 'Erro ao criar pagamento');
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
        setError(error instanceof Error ? error.message : 'Erro interno do servidor');
      toast({
        title: "Erro no Pagamento",
        description: error instanceof Error ? error.message : "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    }
  };

  return (
    <>
      <Button
        onClick={handleCreatePayment}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {isLoading ? 'Criando pagamento...' : `Pagar R$ ${Math.max(props.amount, 5.00).toFixed(2)}`}
      </Button>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          </div>
      )}

      {stripeLoadError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{stripeLoadError}</p>
        </div>
      )}

      {clientSecret && stripePromise && !stripeLoadError && (
        <Elements stripe={stripePromise}>
          <PaymentForm {...props} clientSecret={clientSecret} />
        </Elements>
      )}
    </>
  );
}
