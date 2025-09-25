import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentFailure() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Extrair parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    const status = urlParams.get('redirect_status');

    if (paymentIntent && status) {
      setPaymentDetails({
        paymentId: paymentIntent,
        status: status === 'failed' ? 'rejected' : status,
        externalReference: paymentIntent
      });
    }
  }, []);

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'rejected':
        return 'Pagamento rejeitado';
      case 'cancelled':
        return 'Pagamento cancelado';
      case 'failed':
        return 'Falha no pagamento';
      default:
        return 'Pagamento não processado';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'rejected':
        return 'O pagamento foi rejeitado. Isso pode acontecer por falta de limite, dados incorretos ou outros motivos relacionados ao método de pagamento.';
      case 'cancelled':
        return 'O pagamento foi cancelado. Você pode tentar novamente quando desejar.';
      case 'failed':
        return 'Ocorreu uma falha técnica durante o processamento do pagamento.';
      default:
        return 'Não foi possível processar seu pagamento no momento.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-700">
            {paymentDetails ? getStatusMessage(paymentDetails.status) : 'Pagamento não processado'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {paymentDetails ? getStatusDescription(paymentDetails.status) : 'Ocorreu um problema durante o processamento do seu pagamento.'}
            </p>

            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <div className="flex justify-between mb-2">
                  <span>ID do Pagamento:</span>
                  <span className="font-mono">{paymentDetails.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-red-600">
                    {getStatusMessage(paymentDetails.status)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">O que você pode fazer:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Verificar os dados do cartão ou método de pagamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Tentar novamente com outro método de pagamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Entrar em contato com nosso suporte se o problema persistir</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/services">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={user?.userType === 'client' ? '/home' : '/provider-dashboard'}>
                <Home className="h-4 w-4 mr-2" />
                Início
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar pagamento novamente
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Se precisar de ajuda, entre em contato conosco
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
