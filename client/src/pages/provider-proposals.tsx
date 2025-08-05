import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { 
  ArrowLeft, MessageCircle, DollarSign, Clock, MapPin, 
  Star, Send, Calendar, User, Search, Filter, Loader2,
  CheckCircle, XCircle, Clock as ClockIcon
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getApiUrl } from "@/lib/api-config";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Proposal {
  id: number;
  serviceRequestId: number;
  professionalId: number;
  proposedPrice: string;
  estimatedTime: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
  updatedAt: string;
  serviceRequest: {
    id: number;
    clientId: number;
    serviceType: string;
    description: string;
    address: string;
    budget: string;
    scheduledDate: string;
    scheduledTime: string;
    urgency: string;
    status: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientProfileImage: string;
    clientCreatedAt: string;
  };
}

export default function ProviderProposals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Carregar propostas do profissional
  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${getApiUrl()}/api/professionals/${user.id}/proposals`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProposals(data);
        } else {
          console.error('Erro ao buscar propostas:', response.status);
          toast({
            title: "Erro",
            description: "Não foi possível carregar suas propostas",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Erro ao buscar propostas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar propostas",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [user, toast]);

  // Filtrar propostas
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.serviceRequest.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.serviceRequest.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.serviceRequest.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted": return "Aceita";
      case "rejected": return "Rejeitada";
      case "completed": return "Concluída";
      case "pending": return "Pendente";
      default: return "Desconhecido";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <ClockIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

    const openChat = async (proposal: Proposal) => {
    try {
      console.log('🚀 Iniciando openChat para proposta:', proposal.id);
      console.log('📋 Dados da proposta:', {
        clientId: proposal.serviceRequest.clientId,
        serviceRequestId: proposal.serviceRequestId,
        serviceType: proposal.serviceRequest.serviceType,
        clientName: proposal.serviceRequest.clientName
      });

      // Verificar se o token existe
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token não encontrado');
        toast({
          title: "Erro",
          description: "Token de autenticação não encontrado. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      // Mostrar loading
      toast({
        title: "Iniciando conversa...",
        description: "Aguarde um momento...",
      });

      const requestBody = {
        clientId: proposal.serviceRequest.clientId,
        serviceRequestId: proposal.serviceRequestId,
        initialMessage: `Olá! Gostaria de conversar sobre o serviço "${proposal.serviceRequest.serviceType}". Minha proposta: R$ ${proposal.proposedPrice} - Tempo estimado: ${proposal.estimatedTime}. ${proposal.message ? `Observações: ${proposal.message}` : ''}`
      };

      console.log('📤 Enviando requisição para /api/conversations');
      console.log('📤 Request body:', requestBody);
      console.log('📤 API URL:', getApiUrl());

      // Criar conversa e enviar mensagem inicial em uma única chamada
      const response = await fetch(`${getApiUrl()}/api/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resposta bem-sucedida:', result);
        
        toast({
          title: "Conversa iniciada!",
          description: `Mensagem enviada para ${proposal.serviceRequest.clientName}`,
        });
        
        // Navegar para a tela de chat com a conversa específica
        console.log('🧭 Navegando para:', `/messages/${result.id}`);
        setLocation(`/messages/${result.id}`);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        console.error('❌ Status:', response.status);
        toast({
          title: "Erro",
          description: errorData.message || "Erro ao iniciar conversa",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao abrir chat:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir chat. Tente novamente.",
        variant: "destructive"
      });
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600 dark:text-gray-400">Carregando suas propostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/provider-dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Minhas Propostas</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-6xl mx-auto">
        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por serviço, cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pendentes
            </Button>
            <Button
              variant={statusFilter === "accepted" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("accepted")}
            >
              Aceitas
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("rejected")}
            >
              Rejeitadas
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Propostas</p>
                  <p className="text-2xl font-bold">{proposals.length}</p>
                </div>
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {proposals.filter(p => p.status === "pending").length}
                  </p>
                </div>
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aceitas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {proposals.filter(p => p.status === "accepted").length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Concluídas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {proposals.filter(p => p.status === "completed").length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Propostas */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm || statusFilter !== "all" ? "Nenhuma proposta encontrada" : "Nenhuma proposta ainda"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== "all" 
                    ? "Tente ajustar os filtros de busca" 
                    : "Você ainda não fez nenhuma proposta. Explore os serviços disponíveis!"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Link href="/provider-dashboard">
                    <Button className="mt-4">
                      Explorar Serviços
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Informações do Serviço */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {proposal.serviceRequest.serviceType}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {proposal.serviceRequest.description}
                          </p>
                        </div>
                        <Badge className={getStatusColor(proposal.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(proposal.status)}
                            {getStatusText(proposal.status)}
                          </div>
                        </Badge>
                      </div>

                      {/* Informações do Cliente */}
                      <div className="flex items-center gap-3">
                        {proposal.serviceRequest.clientProfileImage ? (
                          <img
                            src={`${getApiUrl()}${proposal.serviceRequest.clientProfileImage}`}
                            alt={proposal.serviceRequest.clientName}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-bold">
                                      ${proposal.serviceRequest.clientName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {proposal.serviceRequest.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {proposal.serviceRequest.clientName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cliente desde {new Date(proposal.serviceRequest.clientCreatedAt).getFullYear()}
                          </p>
                        </div>
                      </div>

                      {/* Detalhes da Proposta */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center">
                          <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Sua Proposta</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(proposal.proposedPrice)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Orçamento Cliente</p>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(proposal.serviceRequest.budget)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Estimado</p>
                          <p className="font-semibold text-purple-600">
                            {proposal.estimatedTime}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <Calendar className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Data Agendada</p>
                          <p className="font-semibold text-orange-600">
                            {proposal.serviceRequest.scheduledDate ? 
                              new Date(proposal.serviceRequest.scheduledDate).toLocaleDateString('pt-BR') : 
                              'Não definida'}
                          </p>
                        </div>
                      </div>

                      {/* Endereço */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{proposal.serviceRequest.address}</span>
                      </div>

                      {/* Mensagem da Proposta */}
                      {proposal.message && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Sua mensagem:</strong> {proposal.message}
                          </p>
                        </div>
                      )}

                      {/* Data da Proposta */}
                      <p className="text-xs text-gray-500">
                        Proposta enviada em {formatDate(proposal.createdAt)}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2 lg:flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openChat(proposal)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat com Cliente
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 