import { useState } from "react";
import { ArrowLeft, CreditCard, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ClientNavbar from "../components/client-navbar";

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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Nome no Cartão</label>
          <Input
            type="text"
            placeholder="João da Silva"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            className="h-10 sm:h-12 text-sm sm:text-base"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Número do Cartão</label>
          <Input
            type="text"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
            className="h-10 sm:h-12 text-sm sm:text-base"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Validade</label>
            <Input
              type="text"
              placeholder="MM/AA"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              maxLength={5}
              className="h-10 sm:h-12 text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">CVV</label>
            <Input
              type="text"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength={4}
              className="h-10 sm:h-12 text-sm sm:text-base"
              required
            />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold"
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
        <div className="max-w-lg mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <h1 className="text-base sm:text-lg font-semibold">Pagamento</h1>
            <div className="w-12 sm:w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Service Summary */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              Resumo do Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-sm sm:text-base">
                <span>Consulta Fisioterapia</span>
                <span>R$ 120,00</span>
              </div>
            <div className="flex justify-between text-sm sm:text-base">
                <span>Taxa de serviço</span>
                <span>R$ 30,00</span>
              </div>
            <div className="border-t pt-2 sm:pt-3">
              <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span>Total</span>
                  <span>R$ {amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Informações de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckoutForm amount={amount} />
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-300">
              Pagamento Seguro
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Suas informações são protegidas com criptografia SSL
            </p>
          </div>
          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
        </div>
      </div>
      <ClientNavbar hidePlus />
    </div>
  );
}