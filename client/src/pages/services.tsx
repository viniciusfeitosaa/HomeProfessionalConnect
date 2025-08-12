import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
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
  Search
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
  offers?: ServiceOffer[]; // Propostas relacionadas a este pedido
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
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  serviceTitle: string;
  serviceRequest?: ServiceRequest; // Pedido relacionado a esta proposta
}

export default function Services() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [serviceOffers, setServiceOffers] = useState<ServiceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'offers'>('requests');
  const [rejectingOfferId, setRejectingOfferId] = useState<number | null>(null);
  const [startingConversationId, setStartingConversationId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brokenOfferImage, setBrokenOfferImage] = useState<Record<number, boolean>>({});

  // Log para debug
  console.log('🔍 Services Component - Estado atual:', {
    activeTab,
    serviceRequestsLength: serviceRequests.length,
    serviceOffersLength: serviceOffers.length,
    loading
  });

  useEffect(() => {
    const loadAll = async () => {
      if (!user?.id) return;
      await fetchServiceRequests();
      await fetchServiceOffers();
    };
    loadAll();
  }, [user]);

  // Recarregar dados ao trocar de aba
  useEffect(() => {
    if (activeTab === 'offers') {
      fetchServiceOffers();
    } else if (activeTab === 'requests') {
      fetchServiceRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Recarregar ao voltar o foco para a aba do navegador
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) {
        fetchServiceOffers();
        fetchServiceRequests();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServiceRequests = async (): Promise<ServiceRequest[]> => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Buscando pedidos... Token:', token ? 'Presente' : 'Ausente');
      console.log('🔍 URL da API:', `${getApiUrl()}/api/service-requests/client`);
      
      const response = await fetch(`${getApiUrl()}/api/service-requests/client`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Response status para pedidos:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pedidos carregados:', data);
        setServiceRequests(data);
        console.log('✅ Estado atualizado com', data.length, 'pedidos');
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar pedidos - Status:', response.status);
        console.error('❌ Erro detalhado:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
    }
    return [];
  };

  const fetchServiceOffers = async (): Promise<ServiceOffer[]> => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Buscando propostas... Token:', token ? 'Presente' : 'Ausente');
      console.log('🔍 URL da API:', `${getApiUrl()}/api/service-offers/client`);
      
      const response = await fetch(`${getApiUrl()}/api/service-offers/client`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Propostas carregadas:', data);
        let offers = Array.isArray(data) ? data : [];

        // Fallback: se não vier nada, buscar por cada solicitação diretamente
        if (offers.length === 0) {
          // Garantir que pedidos estejam carregados antes do fallback
          let requests = serviceRequests;
          if (!requests || requests.length === 0) {
            requests = await fetchServiceRequests();
          }
          if (requests && requests.length > 0) {
          console.log('⚠️ Sem propostas no endpoint agregador. Buscando por pedido...');
          const reqIds = requests.map(r => r.id);
          const byRequest = await Promise.all(
            reqIds.map(async (id) => {
              const r = await fetch(`${getApiUrl()}/api/service-requests/${id}/offers`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!r.ok) return [] as any[];
              const arr = await r.json();
              return Array.isArray(arr) ? arr : [];
            })
          );
          const flat = byRequest.flat();
          // Normalizar campos para o shape do frontend
          offers = flat.map((o: any) => ({
            id: o.id,
            serviceRequestId: o.serviceRequestId,
            professionalId: o.professionalId,
            professionalName: o.professionalName,
            professionalRating: Number(o.professionalRating) || 5.0,
            professionalTotalReviews: Number(o.professionalTotalReviews) || 0,
            professionalProfileImage: o.professionalProfileImage || null,
            price: typeof o.price === 'number' ? o.price : (parseFloat(o.price ?? o.proposedPrice ?? '0') || 0),
            estimatedTime: o.estimatedTime,
            message: o.message,
            status: o.status,
            createdAt: o.createdAt,
            serviceTitle: o.serviceTitle || ''
          }));
          console.log('✅ Propostas agregadas por pedido:', offers.length);
          }
        }

        setServiceOffers(offers);
        console.log('✅ Estado atualizado com', offers.length, 'propostas');
        return offers;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar propostas - Status:', response.status);
        console.error('❌ Erro detalhado:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar propostas:', error);
    } finally {
      setLoading(false);
    }
    return [];
  };

  const acceptOffer = async (offerId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/service-offers/${offerId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh data
        await Promise.all([fetchServiceOffers(), fetchServiceRequests()]);
      }
    } catch (error) {
      console.error('Erro ao aceitar proposta:', error);
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
        await fetchServiceOffers();
        setRejectingOfferId(null);
      }
    } catch (error) {
      console.error('Erro ao rejeitar proposta:', error);
    }
  };

  const startConversation = async (professionalId: number, offerId: number) => {
    setStartingConversationId(offerId);
    try {
      const token = localStorage.getItem('token');
      const offer = serviceOffers.find(o => o.id === offerId);
      const message = `Olá! Gostaria de conversar sobre sua proposta para "${offer?.serviceTitle}".`;
      
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
        setLocation('/messages');
      } else {
        console.error('Erro ao iniciar conversa');
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    } finally {
      setStartingConversationId(null);
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
      'acompanhante_hospitalar': 'Acompanhante Hospitalar',
      'cuidador_idosos': 'Cuidador de Idosos',
      'enfermagem_domiciliar': 'Enfermagem Domiciliar',
      'fisioterapia': 'Fisioterapia',
      'nutricao': 'Nutrição',
      'psicologia': 'Psicologia',
      'terapia_ocupacional': 'Terapia Ocupacional',
      'servicos_gerais': 'Serviços Gerais'
    };
    
    return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filtrar propostas: apenas das solicitações do cliente + busca + status
  const clientRequestIds = new Set(serviceRequests.map(r => r.id));
  const filteredOffers = serviceOffers.filter(offer => {
    const belongsToClient = serviceRequests.length === 0 || clientRequestIds.has(offer.serviceRequestId);
    if (!belongsToClient) return false;
    const matchesSearch = searchTerm === '' || 
      offer.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Agrupar propostas por pedido para melhor visualização
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
              <Link href="/servico">
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo Pedido</span>
                </button>
              </Link>
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
                    <Search className="absolute left-3 top-1/2 transform -translate-x-1/2 h-4 w-4 text-gray-400" />
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
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden shadow-md">
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
                            <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
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
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {offer.status === 'accepted' ? 'Aceita' :
                               offer.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
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
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${withinBudget ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                              R$ {offer.price.toFixed(2)}
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
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                </div>
                                Rejeitar Proposta
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-left space-y-4">
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
                                        <UserIcon className="h-5 w-5 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900">{offer.professionalName}</p>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                        <span className="flex items-center gap-1">
                                          <DollarSign className="h-4 w-4" />
                                          R$ {offer.price.toFixed(2)}
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
                          onClick={() => startConversation(offer.professionalId, offer.id)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      {serviceRequests.filter(r => r.status === 'open').length}
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
                      {serviceRequests.filter(r => r.status === 'in_progress').length}
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
                    <div key={request.id} className="bg-white rounded-xl p-4 sm:p-5 shadow-md border border-gray-100 hover:shadow-lg hover:ring-1 hover:ring-orange-200 transition-all duration-200">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
                              <p className="text-sm font-medium text-blue-800 truncate">{request.location && request.location.trim() !== '' ? request.location : 'Não informado'}</p>
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
                          <Link href="/my-service-requests">
                            <button className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                              Ver Detalhes
                            </button>
                          </Link>
                          <Link href={`/servico`}>
                            <button className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg">
                              Editar
                            </button>
                          </Link>
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`${getApiUrl()}/api/service-requests/${request.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (response.ok) {
                                  // Atualiza a lista de pedidos no estado
                                  setServiceRequests(prev => prev.filter(r => r.id !== request.id));
                                } else {
                                  console.error('Falha ao excluir solicitação');
                                }
                              } catch (err) {
                                console.error('Erro ao excluir solicitação:', err);
                              }
                            }}
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
    </div>
  );
}