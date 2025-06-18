import { useState } from "react";
import { ArrowLeft, CreditCard, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CheckoutForm = ({ amount }: { amount: number }) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount,
        card: { cardNumber, expiryDate, cvv, cardHolder }
      });

      if (response.ok) {
        toast({
          title: "Pagamento Realizado",
          description: "Seu pagamento foi processado com sucesso!",
        });
        setLocation("/profile");
      }
    } catch (error: any) {
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome no Cartão</label>
          <Input
            type="text"
            placeholder="João da Silva"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Número do Cartão</label>
          <Input
            type="text"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Validade</label>
            <Input
              type="text"
              placeholder="MM/AA"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              maxLength={5}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CVV</label>
            <Input
              type="text"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength={4}
              required
            />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-3 text-lg font-semibold"
      >
        {isLoading ? "Processando..." : `Pagar R$ ${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default function Payment() {
  const [, setLocation] = useLocation();
  const amount = 150; // Demo amount

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </Button>
            <h1 className="text-lg font-semibold">Pagamento</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Service Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Resumo do Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Consulta Fisioterapia</span>
                <span>R$ 120,00</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de serviço</span>
                <span>R$ 30,00</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>R$ {amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckoutForm amount={amount} />
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <Shield className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Pagamento Seguro
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Suas informações são protegidas com criptografia SSL
            </p>
          </div>
          <Check className="h-5 w-5 text-green-600" />
        </div>
      </div>
    </div>
  );
}