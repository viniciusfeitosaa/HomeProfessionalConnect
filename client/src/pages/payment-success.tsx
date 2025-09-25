import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Home, Receipt } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentSuccess() {
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
        status: status === 'succeeded' ? 'approved' : status,
        externalReference: paymentIntent
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Pagamento Aprovado!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Seu pagamento foi processado com sucesso. O profissional foi notificado e em breve entrará em contato.
            </p>

            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <div className="flex justify-between mb-2">
                  <span>ID do Pagamento:</span>
                  <span className="font-mono">{paymentDetails.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">
                    {paymentDetails.status === 'approved' ? 'Aprovado' : paymentDetails.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Próximos passos:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>O profissional foi notificado sobre o pagamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Ele entrará em contato para agendar o serviço</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Após a conclusão, você poderá avaliar o serviço</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/services">
                <Receipt className="h-4 w-4 mr-2" />
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
            <p className="text-xs text-gray-500">
              Você receberá um e-mail de confirmação em breve
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
