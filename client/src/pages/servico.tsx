import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { BottomNavigation } from "@/components/bottom-navigation";
import { getApiUrl } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, CheckCircle, Loader2 } from "lucide-react";
import ClientNavbar from "../components/client-navbar";

export default function Servico() {
  console.log('Servico component rendering');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Todos os hooks devem ser declarados ANTES de qualquer return condicional
  const [category, setCategory] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, isLoading });
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para acessar esta página",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation, toast]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não mostrar nada se não estiver autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  const categories = [
    { value: "acompanhante_hospitalar", label: "Acompanhante Hospitalar", icon: "🏥" }
  ];



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para solicitar um serviço",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/api/service-request`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          category,
          serviceType, 
          description, 
          address: buildFullAddress(), 
          scheduledDate, 
          scheduledTime,
          budget: budget ? parseFloat(budget) : null
        }),
        credentials: "include"
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        toast({
          title: "Sucesso!",
          description: "Sua solicitação foi enviada com sucesso. Profissionais serão notificados.",
        });
        
        // Reset form
        setCategory("");
        setServiceType("");
        setDescription("");
        setCep("");
        setStreet("");
        setNumber("");
        setNeighborhood("");
        setCity("");
        setState("");
        setScheduledDate("");
        setScheduledTime("");
        setBudget("");
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Erro ao enviar solicitação",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue)?.icon || "📋";
  };

  // Função para buscar endereço pelo CEP
  const searchCep = async (cepValue: string) => {
    if (cepValue.length !== 8) return;
    
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
        
        toast({
          title: "Endereço encontrado!",
          description: "Endereço preenchido automaticamente pelo CEP",
          variant: "default",
        });
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar endereço pelo CEP",
        variant: "destructive",
      });
    } finally {
      setLoadingCep(false);
    }
  };

  // Função para formatar CEP
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para montar endereço completo
  const buildFullAddress = () => {
    const parts = [street, number, neighborhood, city, state].filter(Boolean);
    return parts.join(", ");
  };





  console.log('Rendering Servico component, auth state:', { isAuthenticated, isLoading });
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pb-24">
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Solicitar Serviço
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Preencha os dados abaixo para solicitar um profissional
            </p>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Nova Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Categoria do Serviço
                  </label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Serviço */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Tipo de Serviço
                  </label>
                  <Input
                    placeholder="Ex: Fisioterapia domiciliar, Acompanhamento hospitalar..."
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Descrição Detalhada
                  </label>
                  <Textarea
                    placeholder="Descreva o serviço que precisa, sintomas, necessidades específicas..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Endereço */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Endereço
                  </label>
                  
                  {/* CEP */}
                  <div className="relative">
                    <Input
                      placeholder="CEP (00000-000)"
                      value={cep}
                      onChange={e => {
                        const formatted = formatCep(e.target.value);
                        setCep(formatted);
                        if (formatted.length === 9) {
                          searchCep(formatted.replace(/\D/g, ''));
                        }
                      }}
                      maxLength={9}
                      required
                    />
                    {loadingCep && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Rua e Número */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Input
                        placeholder="Rua/Avenida"
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Número"
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Bairro */}
                  <Input
                    placeholder="Bairro"
                    value={neighborhood}
                                            onChange={e => setNeighborhood(e.target.value)}
                    required
                  />

                  {/* Cidade e Estado */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Cidade"
                      value={city}
                                              onChange={e => setCity(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Estado"
                      value={state}
                                              onChange={e => setState(e.target.value)}
                      maxLength={2}
                      required
                    />
                  </div>

                  {/* Endereço Completo (Read-only) */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Endereço Completo
                    </label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {buildFullAddress() || "Preencha os campos acima ou digite o CEP para preenchimento automático"}
                    </p>
                  </div>
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Data
                    </label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={e => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Hora
                    </label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={e => setScheduledTime(e.target.value)}
                      required
                    />
                  </div>
                </div>



                {/* Orçamento (Opcional) */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Orçamento Previsto (Opcional)
                  </label>
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Botão de Envio */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Solicitar Serviço
                    </>
                  )}
                </Button>
              </form>

              {/* Resumo da Solicitação */}
              {success && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Solicitação Enviada!</span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    Profissionais da categoria {getCategoryIcon(category)} serão notificados sobre sua solicitação.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ClientNavbar hidePlus />
    </div>
  );
} 