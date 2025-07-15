import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Página não encontrada</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>

          <Button 
            onClick={() => setLocation("/")}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
