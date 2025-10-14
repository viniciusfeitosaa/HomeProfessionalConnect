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
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
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

  // Abrir chat com cliente
  const openChat = (proposal: Proposal) => {
    // Implementar lógica do chat
    toast({
      title: "Chat",
      description: "Funcionalidade de chat será implementada em breve",
    });
  };

  // Confirmar conclusão do serviço
  const confirmServiceCompletion = async (proposal: Proposal) => {
    if (!user) return;

    try {
      const response = await fetch(`${getApiUrl()}/api/service/${proposal.serviceRequestId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Serviço concluído com sucesso'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const paymentMessage = data.hasPendingPayment 
          ? ` O pagamento de R$ ${data.paymentStatus === 'authorized' ? 'está retido e ' : ''}será liberado quando o cliente confirmar.`
          : '';
          
        toast({
          title: "Sucesso!",
          description: `Serviço marcado como concluído. Aguardando confirmação do cliente.${paymentMessage}`,
          duration: 5000,
        });
        
        // Recarregar propostas para atualizar o status
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao confirmar conclusão do serviço",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao confirmar conclusão:', error);
      toast({
        title: "Erro",
        description: "Erro ao confirmar conclusão do serviço",
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Campo de Busca */}
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por serviço, cliente ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2 lg:gap-3 flex-nowrap overflow-x-auto">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  statusFilter === "all"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  statusFilter === "pending"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setStatusFilter("accepted")}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  statusFilter === "accepted"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Aceitas
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  statusFilter === "rejected"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Rejeitadas
              </button>
            </div>
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
                        <div className="relative w-10 h-10">
                          {proposal.serviceRequest.clientProfileImage && (
                            <img
                              src={`${getApiUrl()}${proposal.serviceRequest.clientProfileImage}`}
                              alt={proposal.serviceRequest.clientName}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          )}
                          <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {proposal.serviceRequest.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {proposal.serviceRequest.clientName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cliente desde {new Date(proposal.serviceRequest.clientCreatedAt).getFullYear()}
                          </p>
                        </div>
                      </div>

                      {/* Detalhes da Proposta - ATUALIZADO */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {/* Valor Total */}
                        <div className="text-center">
                          <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(proposal.serviceRequest.budget)}
                          </p>
                        </div>
                        
                        {/* Horário */}
                        <div className="text-center">
                          <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Horário</p>
                          <p className="font-semibold text-purple-600">
                            {proposal.serviceRequest.scheduledTime || 'Não definido'}
                          </p>
                        </div>
                        
                        {/* Data Início */}
                        <div className="text-center">
                          <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Data Início</p>
                          <p className="font-semibold text-blue-600 text-xs">
                            {proposal.serviceRequest.scheduledDate ? 
                              new Date(proposal.serviceRequest.scheduledDate).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit'
                              }) : '-'}
                          </p>
                        </div>
                        
                        {/* Data Fim */}
                        <div className="text-center">
                          <Calendar className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Data Fim</p>
                          <p className="font-semibold text-indigo-600 text-xs">
                            {proposal.serviceRequest.scheduledDate ? (() => {
                              const startDate = new Date(proposal.serviceRequest.scheduledDate);
                              const endDate = new Date(startDate);
                              const days = (proposal.serviceRequest as any).numberOfDays || 1;
                              endDate.setDate(startDate.getDate() + (days - 1));
                              return endDate.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit'
                              });
                            })() : '-'}
                          </p>
                        </div>
                        
                        {/* Período */}
                        <div className="text-center">
                          <Calendar className="h-5 w-5 text-teal-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Período</p>
                          <p className="font-semibold text-teal-600">
                            {(proposal.serviceRequest as any).numberOfDays || 1} {((proposal.serviceRequest as any).numberOfDays || 1) === 1 ? 'dia' : 'dias'}
                          </p>
                        </div>
                      </div>

                      {/* Sua Proposta - Destaque (compacto) */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sua Proposta:</span>
                          </div>
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(proposal.proposedPrice)}
                          </span>
                        </div>
                        {(proposal.serviceRequest as any).dailyRate && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-1.5">
                            Valor diário do cliente: {formatCurrency((proposal.serviceRequest as any).dailyRate)}/dia
                          </div>
                        )}
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
                      {/* Botão para confirmar conclusão (apenas para propostas aceitas e serviços não concluídos) */}
                      {proposal.status === 'accepted' && proposal.serviceRequest?.status !== 'awaiting_confirmation' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => confirmServiceCompletion(proposal)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmar Conclusão
                        </Button>
                      )}
                      
                      {/* Mostrar status quando o serviço já foi concluído */}
                      {proposal.status === 'accepted' && proposal.serviceRequest?.status === 'awaiting_confirmation' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">
                              Serviço Concluído - Aguardando Confirmação do Cliente
                            </span>
                          </div>
                        </div>
                      )}
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