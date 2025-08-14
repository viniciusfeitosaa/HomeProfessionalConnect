import React, { useState, useEffect } from 'react';
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
  User as UserIcon,
  Briefcase,
  ArrowLeft,
  Loader2,
  Edit3,
  Eye,
  Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getApiUrl } from '../lib/api-config';

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
}

export default function MyServiceRequests() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchServiceRequests();
    }
  }, [user]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/service-requests/client`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServiceRequests(data);
        console.log('✅ Pedidos carregados:', data.length);
      } else {
        console.error('❌ Erro ao buscar pedidos - Status:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in_progress': return 'Em Andamento';
      case 'cancelled': return 'Cancelado';
      case 'open': return 'Aberto';
      default: return status;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando seus pedidos...</p>
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
                onClick={() => setLocation("/services")}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Meus Pedidos</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/services">
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Propostas</span>
                </button>
              </Link>
              <button
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
                  setLocation('/servico');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Pedido</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-xl font-bold text-gray-900">{serviceRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Propostas Recebidas</p>
                <p className="text-xl font-bold text-gray-900">
                  {serviceRequests.reduce((acc, req) => acc + (Number((req as any).responseCount) || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pedidos Ativos</p>
                <p className="text-xl font-bold text-gray-900">
                  {serviceRequests.filter(req => req.status === 'open' || req.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Requests List */}
        <div className="space-y-6">
          {serviceRequests.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido criado</h3>
              <p className="text-gray-600 mb-6">Crie seu primeiro pedido de serviço e receba propostas de profissionais qualificados.</p>
              <Link href="/servico">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                  Criar Primeiro Pedido
                </button>
              </Link>
            </div>
          ) : (
            serviceRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{request.title}</h3>
                      <p className="text-sm text-blue-600 font-semibold mb-3 bg-blue-50 px-3 py-1 rounded-full inline-block">
                        {formatCategory(request.category)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(request.urgency)}`}>
                      Urgência {getUrgencyText(request.urgency)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Descrição do Serviço</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{request.description}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-700 font-medium mb-1">Localização</p>
                        <p className="text-sm font-semibold text-blue-800 truncate">{request.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-green-700 font-medium mb-1">Orçamento Máximo</p>
                         <p className="text-sm font-semibold text-green-800">
                           R$ {(() => {
                             const n = typeof request.budget === 'number' ? request.budget : parseFloat((request.budget as any) ?? '0');
                             return isNaN(n) ? '0,00' : n.toFixed(2);
                           })()}
                         </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-purple-700 font-medium mb-1">Criado em</p>
                        <p className="text-sm font-semibold text-purple-800">
                          {new Date(request.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proposals Section */}
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Propostas Recebidas</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-orange-600">{request.responseCount}</span>
                      <span className="text-sm text-gray-600">
                        {request.responseCount === 1 ? 'proposta recebida' : 'propostas recebidas'}
                      </span>
                    </div>
                    {request.responseCount > 0 && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                        Aguardando análise
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  {request.responseCount > 0 && (
                    <Link href="/services" className="flex-1">
                      <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                        <Eye className="h-4 w-4" />
                        Ver Propostas ({request.responseCount})
                      </button>
                    </Link>
                  )}
                  
                  <Link href="/servico" className="flex-1">
                    <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                      <Edit3 className="h-4 w-4" />
                      Editar Pedido
                    </button>
                  </Link>

                  {request.status === 'open' && (
                    <button className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                      <Trash2 className="h-4 w-4" />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
