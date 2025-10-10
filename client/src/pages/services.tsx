import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Plus, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  User as UserIcon,
  Briefcase,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Eye,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getApiUrl } from '../lib/api-config';
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
} from "../components/ui/alert-dialog";
import RatingPopup from '../components/rating-popup';
import PaymentButton from '../components/payment-button';

interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  status: string;
  createdAt: string;
  responseCount: number;
  offers?: ServiceOffer[];
}

interface ServiceOffer {
  id: number;
  serviceRequestId: number;
  professionalId: number;
  professionalName: string;
  professionalRating: number;
  professionalTotalReviews: number;
  professionalProfileImage: string | null;
  price: number;
  estimatedTime: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'paid';
  createdAt: string;
  serviceTitle: string;
  serviceStatus: string;
  serviceRequest?: ServiceRequest;
}

export default function Services() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [serviceOffers, setServiceOffers] = useState<ServiceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'offers'>('requests');
  const [rejectingOfferId, setRejectingOfferId] = useState<number | null>(null);
  const [startingConversationId, setStartingConversationId] = useState<number | null>(null);
  const [confirmingServiceId, setConfirmingServiceId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brokenOfferImage, setBrokenOfferImage] = useState<Record<number, boolean>>({});
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [serviceToRate, setServiceToRate] = useState<number | null>(null);

  // Utilitário: garante número a partir de string/indefinido
  const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    const n = parseFloat(String(value ?? ''));
    return Number.isNaN(n) ? fallback : n;
  };

  // Validação de CPF melhorada
  const isValidCPF = useCallback((cpfRaw: string): boolean => {
    const cpf = cpfRaw.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    const calc = (b: number) => {
      let s = 0;
      for (let i = 0; i < b; i++) {
        s += parseInt(cpf[i], 10) * (b + 1 - i);
      }
      const r = (s * 10) % 11;
      return r === 10 ? 0 : r;
    };
    
    return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10);
  }, []);

  // Validação de telefone melhorada
  const isValidPhone = useCallback((phone: string): boolean => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 11 && digits[0] !== '0' && digits[1] !== '0' && digits[2] === '9';
  }, []);

  // Validação de email melhorada
  const isValidEmail = useCallback((email: string): boolean => {
    return !!(email && /.+@.+\..+/.test(email.trim()));
  }, []);

  // Verificar se o perfil está completo
  const isProfileComplete = useCallback((): { complete: boolean; steps: number; total: number } => {
    const emailOk = isValidEmail(user?.email || '');
    const phoneOk = isValidPhone(user?.phone || '');
    const cpfStored = (typeof window !== 'undefined' ? localStorage.getItem('client_cpf') : '') || '';
    const cpfOk = isValidCPF(cpfStored);
    
    const steps = [emailOk, phoneOk, cpfOk].filter(Boolean).length;
    return { complete: steps === 3, steps, total: 3 };
  }, [user?.email, user?.phone, isValidEmail, isValidPhone, isValidCPF]);

  // Log para debug
  console.log('🔍 Services Component - Estado atual:', {
    activeTab,
    serviceRequestsLength: serviceRequests.length,
    serviceOffersLength: serviceOffers.length,
    loading
  });

  // Função para buscar pedidos de serviço
  const fetchServiceRequests = useCallback(async (): Promise<ServiceRequest[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token não encontrado');
        return [];
      }

      console.log('🔍 Buscando pedidos...');
      
      const response = await fetch(`${getApiUrl()}/api/service-requests/client`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pedidos carregados:', data);
        setServiceRequests(data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar pedidos:', response.status, errorText);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus pedidos de serviço",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive"
      });
    }
    return [];
  }, [toast]);

  // Função para buscar propostas de serviço
  const fetchServiceOffers = useCallback(async (): Promise<ServiceOffer[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token não encontrado');
        return [];
      }

      console.log('🔍 Buscando propostas...');
      
      const response = await fetch(`${getApiUrl()}/api/service-offers/client`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Propostas carregadas:', data);
        
        let offers = Array.isArray(data) ? data : [];
        
        // Normalizar campos
        offers = offers.map((o: any) => ({
          ...o,
          professionalRating: toNumber(o?.professionalRating, 5.0),
          professionalTotalReviews: toNumber(o?.professionalTotalReviews, 0),
          price: toNumber(o?.price ?? o?.proposedPrice, 0),
          estimatedTime: toNumber(o?.estimatedTime, 0),
          serviceStatus: o?.serviceStatus || 'open'
        }));

        setServiceOffers(offers);
        return offers;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar propostas:', response.status, errorText);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as propostas",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar propostas:', error);
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
    return [];
  }, [toast]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchServiceRequests(), fetchServiceOffers()]);
      };
      loadData();
    }
  }, [user?.id, fetchServiceRequests, fetchServiceOffers]);

  // Recarregar dados ao trocar de aba
  useEffect(() => {
    if (user?.id) {
      if (activeTab === 'offers') {
        fetchServiceOffers();
      } else if (activeTab === 'requests') {
        fetchServiceRequests();
      }
    }
  }, [activeTab, user?.id, fetchServiceRequests, fetchServiceOffers]);

  // Recarregar ao voltar o foco para a aba do navegador
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        if (activeTab === 'offers') {
          fetchServiceOffers();
        } else {
          fetchServiceRequests();
        }
      }
    };
    
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [activeTab, user?.id, fetchServiceRequests, fetchServiceOffers]);

  const acceptOffer = async (offerId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/service-offers/${offerId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Proposta aceita com sucesso!",
        });
        await Promise.all([fetchServiceOffers(), fetchServiceRequests()]);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.message || "Não foi possível aceitar a proposta",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao aceitar proposta:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao aceitar a proposta",
        variant: "destructive"
      });
    }
  };

  const rejectOffer = async (offerId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/service-offers/${offerId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Proposta rejeitada",
          description: "A proposta foi rejeitada com sucesso.",
        });
        setServiceOffers(prev => prev.filter(o => o.id !== offerId));
        setRejectingOfferId(null);
        await Promise.all([fetchServiceRequests(), fetchServiceOffers()]);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.message || "Não foi possível rejeitar a proposta",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao rejeitar proposta:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao rejeitar a proposta",
        variant: "destructive"
      });
    }
  };

  const startConversation = async (professionalId: number, offerId: number) => {
    setStartingConversationId(offerId);
    try {
      const token = localStorage.getItem('token');
      const offer = serviceOffers.find(o => o.id === offerId);
      const message = `Olá! Gostaria de conversar sobre sua proposta para "${offer?.serviceTitle}".`;
      
      console.log('🔍 Tentando iniciar conversa:', {
        professionalId,
        offerId,
        offerDetails: offer ? {
          id: offer.id,
          professionalId: offer.professionalId,
          professionalName: offer.professionalName,
          professionalUserId: (offer as any).professionalUserId
        } : 'Offer não encontrado'
      });
      
      const response = await fetch(`${getApiUrl()}/api/messages/start-conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          professionalId,
          message
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conversa iniciada:', data);
        toast({
          title: "Conversa iniciada!",
          description: "Redirecionando para as mensagens...",
        });
        setLocation('/messages');
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao iniciar conversa:', errorData);
        toast({
          title: "Erro",
          description: errorData.message || "Não foi possível iniciar a conversa",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao iniciar conversa",
        variant: "destructive"
      });
    } finally {
      setStartingConversationId(null);
    }
  };

  const confirmServiceCompletion = async (serviceRequestId: number) => {
    try {
      setConfirmingServiceId(serviceRequestId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/service/${serviceRequestId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        
        toast({
          title: "Sucesso!",
          description: "Serviço confirmado como concluído. O pagamento será liberado para o profissional.",
        });
        
        await Promise.all([fetchServiceOffers(), fetchServiceRequests()]);
        
        // Mostrar popup de avaliação se necessário
        if (responseData.requiresReview) {
          setServiceToRate(serviceRequestId);
          setShowRatingPopup(true);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.message || "Não foi possível confirmar a conclusão do serviço",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao confirmar conclusão do serviço:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao confirmar conclusão do serviço",
        variant: "destructive"
      });
    } finally {
      setConfirmingServiceId(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return urgency;
    }
  };

  const formatCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'acompanhante_hospitalar': 'Acompanhante Hospitalar'
    };
    
    return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Função para deletar pedido de serviço
  const deleteServiceRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/service-requests/${requestId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast({
          title: "Pedido excluído",
          description: "O pedido foi excluído com sucesso.",
        });
        setServiceRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.message || "Não foi possível excluir o pedido",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao excluir o pedido",
        variant: "destructive"
      });
    }
  };

  // Função para verificar perfil e redirecionar
  const handleCreateService = () => {
    const profileStatus = isProfileComplete();
    
    if (!profileStatus.complete) {
      toast({
        title: "Verificação em andamento",
        description: `Conclua seu cadastro (${profileStatus.steps}/${profileStatus.total}): Email, Telefone e CPF para criar um serviço.`
      });
      setLocation('/profile');
      return;
    }
    
    setLocation('/servico');
  };

  const handleRatingSubmitted = () => {
    // Recarregar dados após avaliação
    fetchServiceOffers();
    fetchServiceRequests();
  };

  const handleCloseRatingPopup = () => {
    setShowRatingPopup(false);
    setServiceToRate(null);
  };

  // Filtrar propostas
  const clientRequestIds = new Set(serviceRequests.map(r => r.id));
  const filteredOffers = serviceOffers.filter(offer => {
    const belongsToClient = serviceRequests.length === 0 || clientRequestIds.has(offer.serviceRequestId);
    if (!belongsToClient) return false;
    
    const matchesSearch = searchTerm === '' || 
      offer.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' 
      ? offer.status !== 'rejected'
      : offer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Agrupar propostas por pedido
  const offersByRequest = serviceOffers.reduce((acc, offer) => {
    if (!acc[offer.serviceRequestId]) {
      acc[offer.serviceRequestId] = [];
    }
    acc[offer.serviceRequestId].push(offer);
    return acc;
  }, {} as { [key: number]: ServiceOffer[] });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLocation("/")}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Meus Serviços</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/agenda">
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Agenda</span>
                </button>
              </Link>
              <button
                onClick={handleCreateService}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Pedido</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                console.log('🔍 Clicou na aba Pedidos');
                setActiveTab('requests');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pedidos ({serviceRequests.length})
            </button>
            <button
              onClick={() => {
                console.log('🔍 Clicou na aba Propostas');
                setActiveTab('offers');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'offers'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Propostas ({serviceOffers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'offers' && (
          <div className="space-y-6">
            {/* Filtros e Busca */}
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Campo de busca */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por profissional, serviço ou mensagem..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
                
                {/* Filtros responsivos */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      statusFilter === 'all'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      statusFilter === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pendentes
                  </button>
                  <button
                    onClick={() => setStatusFilter('accepted')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      statusFilter === 'accepted'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Aceitas
                  </button>
                  <button
                    onClick={() => setStatusFilter('rejected')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      statusFilter === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejeitadas
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      statusFilter === 'completed'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Concluídas
                  </button>
                </div>
              </div>
            </div>

            {/* Header da seção Propostas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Propostas Recebidas</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                  {filteredOffers.length}
                </span>
              </div>
            </div>

            {/* Lista de Propostas */}
                {filteredOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Não há propostas no momento</h3>
                <p className="text-gray-600">Assim que profissionais enviarem propostas, elas aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOffers.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg hover:ring-1 hover:ring-orange-200 transition-all duration-200">
                    {/* Header com foto e informações do profissional */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center overflow-hidden shadow-md ring-2 ring-white">
                          {offer.professionalProfileImage && !brokenOfferImage[offer.id] ? (
                            <img
                              src={offer.professionalProfileImage.startsWith('http')
                                ? offer.professionalProfileImage
                                : `${getApiUrl()}${offer.professionalProfileImage}`
                              }
                              alt={offer.professionalName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                              sizes="(max-width: 640px) 3rem, (max-width: 1024px) 3.5rem, 4rem"
                              onError={() => setBrokenOfferImage((prev) => ({ ...prev, [offer.id]: true }))}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{offer.professionalName}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">{offer.professionalRating}</span>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-500">
                                ({offer.professionalTotalReviews} {offer.professionalTotalReviews === 1 ? 'avaliação' : 'avaliações'})
                              </span>
                            </div>
                          </div>

                          <div className="flex-shrink-0 mt-2 sm:mt-0">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              offer.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {offer.status === 'accepted' ? 'Aceita' :
                               offer.status === 'rejected' ? 'Rejeitada' :
                               offer.status === 'completed' ? 'Concluída' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Serviço solicitado */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <p className="text-sm text-blue-800 font-semibold">Serviço Solicitado</p>
                      </div>
                      <p className="text-base text-blue-900 font-bold">{formatCategory(offer.serviceTitle)}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-blue-700">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(offer.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Comparação com orçamento do pedido */}
                    {(() => {
                      const relatedRequest = serviceRequests.find(r => r.id === offer.serviceRequestId);
                      if (!relatedRequest) return null;
                      const requestBudget = typeof relatedRequest.budget === 'number' 
                        ? relatedRequest.budget 
                        : parseFloat((relatedRequest as any).budget ?? '0') || 0;
                      const offerPrice = typeof (offer as any).price === 'number' 
                        ? (offer as any).price 
                        : parseFloat((offer as any).price ?? '0') || 0;
                      const withinBudget = offerPrice <= requestBudget;
                      const diff = Math.abs(requestBudget - offerPrice);
                      return (
                        <div className="mb-4 p-4 rounded-lg border bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">Comparação com orçamento</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${withinBudget 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm'}`}>
                              {withinBudget ? 'Dentro do orçamento' : 'Acima do orçamento'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg border bg-gradient-to-r from-orange-50 to-yellow-50">
                              <p className="text-xs text-gray-700">Orçamento do pedido</p>
                              <p className="text-sm font-semibold text-gray-900">R$ {requestBudget.toFixed(2)}</p>
                            </div>
                            <div className="p-3 rounded-lg border bg-gradient-to-r from-orange-50 to-yellow-50">
                              <p className="text-xs text-gray-700">Proposta do profissional</p>
                              <p className="text-sm font-semibold text-gray-900">R$ {offerPrice.toFixed(2)}</p>
                            </div>
                            <div className="p-3 rounded-lg border bg-gradient-to-r from-orange-50 to-yellow-50">
                              <p className="text-xs text-gray-700">Diferença</p>
                              <p className={`text-sm font-semibold ${withinBudget ? 'text-green-700' : 'text-red-700'}`}>
                                {withinBudget ? '-' : '+'} R$ {diff.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Mensagem da proposta */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Proposta do Profissional</h4>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed italic">"{offer.message}"</p>
                      </div>
                    </div>

                    {/* Preço e Tempo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-700 mb-1">Preço</p>
                            <p className="text-sm sm:text-base font-semibold text-green-800 truncate">
                              R$ {toNumber(offer.price, 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-blue-700 mb-1">Tempo estimado</p>
                            <p className="text-sm sm:text-base font-semibold text-blue-800 truncate">
                              {offer.estimatedTime} horas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    {offer.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => acceptOffer(offer.id)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Aceitar</span>
                          <span className="sm:hidden">Aceitar</span>
                        </button>

                        <AlertDialog open={rejectingOfferId === offer.id} onOpenChange={(open) => !open && setRejectingOfferId(null)}>
                          <AlertDialogTrigger asChild>
                            <button
                              onClick={() => setRejectingOfferId(offer.id)}
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                            >
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Rejeitar</span>
                              <span className="sm:hidden">Rejeitar</span>
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border border-gray-200">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                </div>
                                Rejeitar Proposta
                              </AlertDialogTitle>
                              <AlertDialogDescription asChild>
                                <div className="text-left space-y-4">
                                  <p>Tem certeza que deseja rejeitar a proposta de <strong>{offer.professionalName}</strong>?</p>
                                  
                                  {/* Card do profissional no dialog */}
                                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                                        {offer.professionalProfileImage && !brokenOfferImage[offer.id] ? (
                                          <img
                                            src={offer.professionalProfileImage.startsWith('http')
                                              ? offer.professionalProfileImage
                                              : `${getApiUrl()}${offer.professionalProfileImage}`
                                            }
                                            alt={offer.professionalName}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                            sizes="2.5rem"
                                            onError={() => setBrokenOfferImage((prev) => ({ ...prev, [offer.id]: true }))}
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-white" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{offer.professionalName}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                          <span className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            R$ {toNumber(offer.price, 0).toFixed(2)}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {offer.estimatedTime} horas
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <p className="text-red-600 font-medium">Esta ação não pode ser desfeita e o profissional será notificado.</p>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => rejectOffer(offer.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Sim, Rejeitar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <button
                          onClick={() => startConversation(offer.professionalUserId || offer.professionalId, offer.id)}
                          disabled={startingConversationId === offer.id}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {startingConversationId === offer.id ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          ) : (
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                          <span className="hidden sm:inline">Conversar</span>
                          <span className="sm:hidden">Chat</span>
                        </button>
                      </div>
                    )}

                    {/* Status do serviço vinculado e ações */}
                    {(offer.status === 'accepted' || offer.status === 'completed') && (
                      <div className="pt-4 border-t border-gray-200">
                        {(() => {
                          const linkedRequest = serviceRequests.find(r => r.id === offer.serviceRequestId);

                          if (!linkedRequest) {
                            return (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                                  <p className="text-sm font-semibold text-yellow-800">Carregando informações do pedido...</p>
                                </div>
                                <p className="text-sm text-yellow-700">
                                  Recarregue a página para sincronizar o status do pedido vinculado a esta proposta.
                                </p>
                              </div>
                            );
                          }

                          const requestStatus = linkedRequest.status;

                          if (requestStatus === 'awaiting_confirmation') {
                            return (
                              <div>
                                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200 mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    <p className="text-sm font-semibold text-orange-800">Serviço Concluído - Aguardando Confirmação</p>
                                  </div>
                                  <p className="text-sm text-orange-700">
                                    O profissional marcou o serviço como concluído. Confirme se tudo está correto para liberar o pagamento.
                                  </p>
                                </div>

                                <button
                                  onClick={() => confirmServiceCompletion(offer.serviceRequestId)}
                                  disabled={confirmingServiceId === offer.serviceRequestId}
                                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {confirmingServiceId === offer.serviceRequestId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                  <span>Confirmar Conclusão do Serviço</span>
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-2">
                                  Confirme para liberar o pagamento ao profissional
                                </p>
                              </div>
                            );
                          }

                          // Proposta concluída (paga e finalizada)
                          if (offer.status === 'completed') {
                            return (
                              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                  <p className="text-sm font-semibold text-emerald-800">Proposta Concluída</p>
                                </div>
                                <p className="text-sm text-emerald-700 mb-3">
                                  ✅ Pagamento realizado com sucesso! O serviço foi concluído e o profissional foi pago.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-100 px-3 py-2 rounded-lg">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="font-medium">Status: Concluído e Pago</span>
                                </div>
                              </div>
                            );
                          }

                          if (requestStatus === 'completed') {
                            return (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                  <p className="text-sm font-semibold text-blue-800">Serviço e pedido concluídos</p>
                                </div>
                                <p className="text-sm text-blue-700 mb-2">
                                  ✅ Pagamento aprovado! O profissional foi notificado e o pedido correspondente está marcado como concluído.
                                </p>
                                <p className="text-xs text-gray-500">
                                  Caso o card do pedido ainda mostre outro status, recarregue esta página para sincronizar os dados.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <p className="text-sm font-semibold text-green-800">Proposta Aceita</p>
                              </div>
                              <p className="text-sm text-green-700 mb-4">
                                Proposta aceita! Efetue o pagamento para que o profissional possa iniciar o serviço.
                              </p>

                              <PaymentButton
                                serviceOfferId={offer.id}
                                serviceRequestId={offer.serviceRequestId}
                                amount={offer.price}
                                serviceName={`${linkedRequest.title || 'Serviço'}`}
                                professionalName={offer.professionalName}
                                onPaymentSuccess={() => {
                                  fetchServiceOffers();
                                  fetchServiceRequests();
                                  toast({
                                    title: "Pagamento Realizado",
                                    description: "Pagamento processado com sucesso! O profissional foi notificado.",
                                  });
                                }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Header da seção Pedidos */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-500" />
                <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Meus Pedidos</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                  {serviceRequests.length}
                </span>
              </div>
            </div>
            {/* Estatísticas dos Pedidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceRequests.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Propostas Recebidas</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceOffers.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pedidos Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {serviceRequests.filter(r => r.status === 'open' || r.status === 'assigned').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Em Andamento</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {serviceRequests.filter(r => r.status === 'in_progress' || r.status === 'awaiting_confirmation').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Concluídos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {serviceRequests.filter(r => r.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Pedidos */}
            {serviceRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido criado</h3>
                <p className="text-gray-600 mb-6">Crie seu primeiro pedido de serviço e receba propostas de profissionais qualificados.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/servico">
                    <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200">
                      Criar Pedido
                    </button>
                  </Link>
                  <Link href="/my-service-requests">
                    <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                      Ver Todos os Pedidos
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceRequests.map((request) => {
                  const requestOffers = offersByRequest[request.id] || [];
                  const pendingOffers = requestOffers.filter(o => o.status === 'pending');
                  const acceptedOffers = requestOffers.filter(o => o.status === 'accepted');

                  return (
                    <div key={request.id} className={`bg-white rounded-xl p-4 sm:p-5 shadow-md border transition-all duration-200 ${
                      request.status === 'completed' 
                        ? 'border-green-200 bg-green-50/30 hover:shadow-lg hover:ring-1 hover:ring-green-200' 
                        : 'border-gray-100 hover:shadow-lg hover:ring-1 hover:ring-orange-200'
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${
                            request.status === 'completed' 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                            {request.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            ) : (
                              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 line-clamp-2">{request.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 font-medium">{formatCategory(request.category)}</p>
                          </div>
                        </div>

                        <div className="flex flex-row gap-2 items-center sm:items-end">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'completed' ? 'bg-green-100 text-green-800' :
                            request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status === 'completed' ? 'Concluído' :
                             request.status === 'in_progress' ? 'Em Andamento' : 'Aberto'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                            {getUrgencyText(request.urgency)}
                          </span>
                        </div>
                      </div>

                      {/* Mensagem para serviços concluídos */}
                      {request.status === 'completed' && (
                        <div className="mb-4 bg-green-100 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-green-800">
                              Serviço Concluído - Este serviço foi finalizado e não pode mais ser editado
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Descrição */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Descrição do serviço</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{request.description}</p>
                        </div>
                      </div>

                      {/* Informações em cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className="text-xs text-blue-700 mb-1">Localização</p>
                              <p className="text-sm font-medium text-blue-800 truncate">{(() => {
                                const raw = (request as any).location ?? (request as any).address ?? '';
                                const text = typeof raw === 'string' ? raw : String(raw ?? '');
                                return text.trim() !== '' ? text : 'Não informado';
                              })()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <DollarSign className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-700 mb-1">Orçamento</p>
                              <p className="text-sm font-medium text-green-800 truncate">
                                R$ {(() => {
                                  const n = typeof request.budget === 'number' ? request.budget : parseFloat((request.budget as any) ?? '0');
                                  return isNaN(n) ? '0,00' : n.toFixed(2);
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-purple-700 mb-1">Criado em</p>
                              <p className="text-sm font-medium text-purple-800 truncate">
                                {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status das Propostas - removido conforme solicitação */}

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
                        <div className="flex-1" />

                        <div className="flex flex-row gap-2">
                          {request.responseCount > 0 && (
                            <button
                              onClick={() => setActiveTab('offers')}
                              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              Ver Propostas ({request.responseCount})
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteServiceRequest(request.id)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab !== 'offers' && activeTab !== 'requests' && (
          <div className="text-center py-12">
            <p className="text-gray-600">Selecione uma aba para continuar</p>
          </div>
        )}
      </div>

      {/* Rating Popup */}
      <RatingPopup
        isOpen={showRatingPopup}
        onClose={handleCloseRatingPopup}
        serviceRequestId={serviceToRate || 0}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
}