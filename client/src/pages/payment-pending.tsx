import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentPending() {
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
        status: status === 'processing' ? 'pending' : status,
        externalReference: paymentIntent
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl text-yellow-700">
            Pagamento Pendente
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Seu pagamento está sendo processado. Isso pode levar alguns minutos para ser confirmado.
            </p>

            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <div className="flex justify-between mb-2">
                  <span>ID do Pagamento:</span>
                  <span className="font-mono">{paymentDetails.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-yellow-600">
                    Processando
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">O que acontece agora:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Aguardando confirmação do pagamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Você receberá uma notificação quando for aprovado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>O profissional será notificado automaticamente</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">Para pagamentos via PIX ou Boleto:</h5>
            <p className="text-sm text-blue-700">
              O pagamento pode levar até 1 hora para ser processado. Você receberá um e-mail de confirmação assim que for aprovado.
            </p>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/services">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Meus Serviços
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
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar status
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Esta página será atualizada automaticamente quando o pagamento for processado
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
