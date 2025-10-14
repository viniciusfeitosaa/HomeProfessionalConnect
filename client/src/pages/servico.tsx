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
import { Calendar, MapPin, CheckCircle, Loader2, ArrowLeft, DollarSign } from "lucide-react";
import ClientNavbar from "../components/client-navbar";

export default function Servico() {
  console.log('Servico component rendering');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numberOfDays, setNumberOfDays] = useState("1");
  const [dailyRate, setDailyRate] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  
  // Calcular número de dias entre duas datas
  const calculateDaysBetweenDates = (start: string, end: string) => {
    if (!start || !end) return 1;
    
    const startD = new Date(start);
    const endD = new Date(end);
    
    const diffTime = endD.getTime() - startD.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o último dia
    
    return diffDays > 0 ? diffDays : 1;
  };
  
  // Atualizar numberOfDays quando datas mudarem
  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateDaysBetweenDates(startDate, endDate);
      setNumberOfDays(days.toString());
      // Atualizar scheduledDate com a data de início
      setScheduledDate(startDate);
    } else if (startDate) {
      setScheduledDate(startDate);
      setNumberOfDays("1");
    }
  }, [startDate, endDate]);
  
  // Calcular total automaticamente
  const calculateTotal = () => {
    const days = parseInt(numberOfDays) || 0;
    const rate = parseFloat(dailyRate) || 0;
    return days * rate;
  };
  
  // Atualizar budget quando dias ou diária mudar
  useEffect(() => {
    const total = calculateTotal();
    if (total > 0) {
      setBudget(total.toFixed(2));
    }
  }, [numberOfDays, dailyRate]);

  // Helpers de verificação
  const isValidEmail = (email?: string) => !!(email && /.+@.+\..+/.test(email.trim()));
  const isValidPhone = (phone?: string) => {
    const digits = (phone || "").replace(/\D/g, "");
    return digits.length === 11 && digits[0] !== '0' && digits[1] !== '0' && digits[2] === '9';
  };
  const isValidCPF = (cpfRaw?: string | null) => {
    const raw = cpfRaw || '';
    const cpf = raw.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    const calc = (b: number) => { let s = 0; for (let i = 0; i < b; i++) s += parseInt(cpf[i], 10) * (b + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
    return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10);
  };
  const isProfileFullyVerified = () => {
    const emailOk = isValidEmail(user?.email);
    const phoneOk = isValidPhone(user?.phone);
    const cpfFromUser = (user as any)?.taxpayerId as string | undefined;
    const cpfFromLocal = (typeof window !== 'undefined' ? localStorage.getItem('client_cpf') : '') || '';
    const cpfOk = isValidCPF(cpfFromUser || cpfFromLocal);
    const steps = [emailOk, phoneOk, cpfOk].filter(Boolean).length;
    return { verified: steps === 3, steps };
  };

  // Verificar se o usuário está autenticado e verificado
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, isLoading });
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para acessar esta página",
        variant: "destructive",
      });
      setLocation("/");
    }
    if (!isLoading && isAuthenticated) {
      const { verified, steps } = isProfileFullyVerified();
      if (!verified) {
        toast({
          title: "Verificação em andamento",
          description: `Conclua seu cadastro (${steps}/3): Email, Telefone e CPF para criar um serviço.`
        });
        setLocation('/profile');
      }
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

    const token = sessionStorage.getItem('token');
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
      const response = await fetch(`${getApiUrl()}/api/service-requests`, {
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
          numberOfDays: parseInt(numberOfDays) || 1,
          dailyRate: parseFloat(dailyRate) || 0,
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
          {/* Botão Voltar */}
          <button
            onClick={() => setLocation('/')}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>

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
                  <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Categoria do Serviço
                  </label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="bg-white border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg h-12 transition-all duration-200">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-lg">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="hover:bg-yellow-50 focus:bg-yellow-50 rounded-md">
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
                  <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Tipo de Serviço
                  </label>
                  <Input
                    placeholder="Ex: Fisioterapia domiciliar, Acompanhamento hospitalar..."
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    className="border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg h-12 transition-all duration-200"
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Descrição Detalhada
                  </label>
                  <Textarea
                    placeholder="Descreva o serviço que precisa, sintomas, necessidades específicas..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg min-h-[100px] transition-all duration-200 resize-none"
                    required
                  />
                </div>

                {/* Endereço */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
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
                      className="border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg h-12 transition-all duration-200"
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
                        className="border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg h-12 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Número"
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                        className="border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg h-12 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Bairro */}
                  <Input
                    placeholder="Bairro"
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    className="border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg h-12 transition-all duration-200"
                    required
                  />

                  {/* Cidade e Estado */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Cidade"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg h-12 transition-all duration-200"
                      required
                    />
                    <Input
                      placeholder="Estado"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      maxLength={2}
                      className="border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg h-12 transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Endereço Completo (Read-only) */}
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                    <label className="block text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                      Endereço Completo
                    </label>
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                      {buildFullAddress() || "Preencha os campos acima ou digite o CEP para preenchimento automático"}
                    </p>
                  </div>
                </div>

                {/* Período do Serviço (Estilo Airbnb) */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período do Serviço
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Data de Início *
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Quando começa?</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Data de Término *
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        disabled={!startDate}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Quando termina?</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Horário de Início *
                    </label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={e => setScheduledTime(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Que horas deve chegar?</p>
                  </div>
                  
                  {/* Resumo do Período */}
                  {startDate && endDate && (
                    <div className="bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Duração do serviço:</span>
                        <span className="font-bold text-blue-600">
                          {numberOfDays} {parseInt(numberOfDays) === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        De {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Valor do Serviço */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor do Serviço
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Quanto Pode Pagar por Dia? *
                    </label>
                    <Input
                      type="number"
                      placeholder="R$ 150,00"
                      value={dailyRate}
                      onChange={e => setDailyRate(e.target.value)}
                      min="1"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Valor que está disposto a pagar por diária</p>
                  </div>
                  
                  {/* Total Calculado */}
                  {calculateTotal() > 0 && (
                    <div className="bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Valor Total do Serviço:
                        </span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          R$ {calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {numberOfDays} {parseInt(numberOfDays) === 1 ? 'dia' : 'dias'} × R$ {parseFloat(dailyRate || '0').toFixed(2)}/dia
                      </div>
                      
                      {/* Aviso sobre transações fora da plataforma */}
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2 text-xs text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                          <span className="text-base">⚠️</span>
                          <div>
                            <p className="font-semibold mb-1">Importante: Pagamentos pela Plataforma</p>
                            <p>
                              Para sua segurança, <strong>todos os pagamentos devem ser feitos pela plataforma</strong>. 
                              Transações fora da plataforma não são protegidas e não podemos intervir em caso de problemas.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão de Envio */}
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Solicitar Serviço</span>
                    </>
                  )}
                </button>
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
    </div>
  );
} 