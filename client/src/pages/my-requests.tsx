import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/api-config';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Trash2, 
  Edit,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ClientNavbar from "../components/client-navbar";

interface ServiceRequest {
  id: number;
  serviceType: string;
  category: string;
  description: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  budget: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  responses?: number;
}

export default function MyRequests() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Buscar solicitações do cliente
  const fetchMyRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Token found
      console.log('👤 Usuário:', user);
      
      if (!token) {
        toast({
          title: "Erro de Autenticação",
          description: "Token não encontrado. Faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      const apiUrl = getApiUrl();
      const fullUrl = `${apiUrl}/api/service-requests/my-requests`;
      console.log('🌐 Fazendo requisição para:', fullUrl);
      console.log('🔑 Token:', token.substring(0, 20) + '...');

      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Resposta do servidor:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dados recebidos:', data);
        setRequests(data);
      } else {
        console.error('❌ Erro ao buscar solicitações:', response.status);
        const errorText = await response.text();
        console.error('📄 Resposta de erro:', errorText);
        toast({
          title: "Erro",
          description: "Erro ao carregar suas solicitações.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Erro ao buscar solicitações:', error);
      toast({
        title: "Erro de Conexão",
        description: "Erro ao conectar com o servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Excluir solicitação
  const deleteRequest = async (requestId: number) => {
    setDeletingId(requestId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Erro de Autenticação",
          description: "Token não encontrado. Faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/service-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast({
          title: "Solicitação Excluída",
          description: "Sua solicitação foi excluída com sucesso.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir solicitação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir solicitação:', error);
      toast({
        title: "Erro de Conexão",
        description: "Erro ao conectar com o servidor.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Carregar solicitações quando o componente montar
  useEffect(() => {
    fetchMyRequests();
  }, [user]);

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Eye className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Função para obter categoria em português
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'acompanhante_hospitalar':
        return 'Acompanhante Hospitalar';
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pb-24">
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Minhas Solicitações
            </h1>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600 dark:text-gray-400">Carregando suas solicitações...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhuma solicitação encontrada</p>
              <p className="text-sm text-gray-500 mb-4">Você ainda não fez nenhuma solicitação de serviço</p>
              <Button onClick={() => {
                const emailOk = !!(user?.email && /.+@.+\..+/.test(user.email.trim()));
                const digits = (user?.phone || "").replace(/\D/g, "");
                const phoneOk = digits.length === 11 && digits[0] !== '0' && digits[1] !== '0' && digits[2] === '9';
                const isValidCPF = (cpfRaw: string) => {
                  const cpf = cpfRaw.replace(/\D/g, '');
                  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
                  const calc = (b: number) => { let s = 0; for (let i = 0; i < b; i++) s += parseInt(cpf[i], 10) * (b + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
                  return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10);
                };
                const cpfStored = (typeof window !== 'undefined' ? localStorage.getItem('client_cpf') : '') || '';
                const cpfOk = isValidCPF(cpfStored);
                const steps = [emailOk, phoneOk, cpfOk].filter(Boolean).length;
                if (steps !== 3) {
                  toast({
                    title: "Verificação em andamento",
                    description: `Conclua seu cadastro (${steps}/3): Email, Telefone e CPF para criar um serviço.`
                  });
                  setLocation('/profile');
                  return;
                }
                setLocation("/servico");
              }}>
                Fazer Primeira Solicitação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Solicitação #{request.id}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(request.status)}`}
                          >
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {getStatusText(request.status)}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getCategoryText(request.category)}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/service-offer/${request.id}`)}
                          disabled={request.status !== 'open'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={request.status !== 'open' || deletingId === request.id}
                            >
                              {deletingId === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Solicitação</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta solicitação? 
                                Esta ação não pode ser desfeita e todos os profissionais 
                                que responderam não poderão mais ver sua solicitação.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteRequest(request.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Service Details */}
                      <div>
                        <p className="font-medium text-primary mb-1">{request.serviceType}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{request.description}</p>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 truncate">
                            {request.address}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(request.scheduledDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {request.scheduledTime}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            R$ {request.budget && !isNaN(Number(request.budget)) ? Number(request.budget).toFixed(2) : 'Não informado'}
                          </span>
                        </div>
                      </div>

                      {/* Responses */}
                      {request.responses !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MessageSquare className="h-4 w-4" />
                          <span>{request.responses} profissional(is) responderam</span>
                        </div>
                      )}

                      {/* Created Date */}
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        Criada em {new Date(request.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(request.createdAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* New Request Button */}
          <div className="mt-6">
            <Button 
              onClick={() => {
                const emailOk = !!(user?.email && /.+@.+\..+/.test(user.email.trim()));
                const digits = (user?.phone || "").replace(/\D/g, "");
                const phoneOk = digits.length === 11 && digits[0] !== '0' && digits[1] !== '0' && digits[2] === '9';
                const isValidCPF = (cpfRaw: string) => {
                  const cpf = cpfRaw.replace(/\D/g, '');
                  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
                  const calc = (b: number) => { let s = 0; for (let i = 0; i < b; i++) s += parseInt(cpf[i], 10) * (b + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
                  return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10);
                };
                const cpfStored = (typeof window !== 'undefined' ? localStorage.getItem('client_cpf') : '') || '';
                const cpfOk = isValidCPF(cpfStored);
                const steps = [emailOk, phoneOk, cpfOk].filter(Boolean).length;
                if (steps !== 3) {
                  toast({
                    title: "Verificação em andamento",
                    description: `Conclua seu cadastro (${steps}/3): Email, Telefone e CPF para criar um serviço.`
                  });
                  setLocation('/profile');
                  return;
                }
                setLocation("/servico");
              }} 
              className="w-full"
            >
              Nova Solicitação
            </Button>
          </div>
        </div>
      </div>
      <ClientNavbar />
    </div>
  );
} 