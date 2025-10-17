import React, { useState, useEffect } from 'react';
import { Star, DollarSign, Calendar, User, MessageCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '../lib/api-config';

interface CompletedService {
  serviceRequestId: number;
  serviceTitle: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  status: string;
  completedAt: string;
  hasReview: boolean;
  reviewRating?: number;
  reviewComment?: string;
  reviewCreatedAt?: string;
  transactionId: number;
  transactionStatus: string;
  transactionCompletedAt: string;
}

interface ProfessionalDashboardProps {
  professionalId: number;
}

export default function ProfessionalDashboard({ professionalId }: ProfessionalDashboardProps) {
  const [completedServices, setCompletedServices] = useState<CompletedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalServices: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [overview, services] = await Promise.all([
          getDashboardOverviewSafe(),
          getCompletedServicesSafe()
        ]);

        // Base pelo histórico real de serviços concluídos
        const servicesStats = computeStatsFromServices(services);

        // Mesclar com overview quando houver valores não nulos/maiores
        const merged = {
          totalEarnings: overview?.totalEarnings && overview.totalEarnings > 0 ? overview.totalEarnings : servicesStats.totalEarnings,
          totalServices: overview?.totalServices && overview.totalServices > 0 ? overview.totalServices : servicesStats.totalServices,
          averageRating: overview?.averageRating && overview.averageRating > 0 ? Math.round(overview.averageRating * 10) / 10 : servicesStats.averageRating,
          totalReviews: overview?.totalReviews && overview.totalReviews > 0 ? overview.totalReviews : servicesStats.totalReviews,
        };

        setStats(merged);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [professionalId]);

  const getDashboardOverviewSafe = async (): Promise<{
    totalEarnings: number;
    totalServices: number;
    averageRating: number;
    totalReviews: number;
  } | null> => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return null;

      const response = await fetch(`${getApiUrl()}/api/provider/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return null;
      const data = await response.json();

      const totalEarnings = Number((data?.totalEarnings?.total ?? data?.totalEarnings ?? 0));
      const totalServices = Number(data?.completedOffers ?? data?.totalServices ?? 0);
      const averageRating = Number(
        data?.avgRating ?? (
          Array.isArray(data?.reviews) && data.reviews.length > 0
            ? (data.reviews.reduce((s: number, r: any) => s + (r?.rating ?? 0), 0) / data.reviews.length)
            : 0
        )
      );
      const totalReviews = Number(Array.isArray(data?.reviews) ? data.reviews.length : (data?.totalReviews ?? 0));

      return {
        totalEarnings,
        totalServices,
        averageRating,
        totalReviews
      };
    } catch {
      return null;
    }
  };

  const getCompletedServicesSafe = async (): Promise<CompletedService[]> => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return [];

      const response = await fetch(`${getApiUrl()}/api/professional/${professionalId}/completed-services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return [];
      const data = await response.json();
      const servicesData = Array.isArray(data?.data) ? data.data : [];
      setCompletedServices(servicesData);
      return servicesData;
    } catch (error) {
      console.error('Erro ao buscar serviços concluídos:', error);
      setCompletedServices([]);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços concluídos",
        variant: "destructive"
      });
      return [];
    }
  };

  const computeStatsFromServices = (services: CompletedService[]) => {
    const totalEarnings = services.reduce((sum: number, s: CompletedService) => sum + Number(s.amount), 0);
    const totalServices = services.length;
    const withReviews = services.filter((s) => s.hasReview);
    const totalReviews = withReviews.length;
    const averageRating = totalReviews > 0
      ? withReviews.reduce((sum, s) => sum + (s.reviewRating || 0), 0) / totalReviews
      : 0;
    return {
      totalEarnings,
      totalServices,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Ganhos Totais</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Serviços Concluídos</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Avaliação Média</p>
              <p className="text-xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Avaliações</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Serviços Concluídos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-5 py-3.5 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Serviços Concluídos</h3>
        </div>
        
        {!completedServices || completedServices.length === 0 ? (
          <div className="p-5 text-center text-gray-500">
            <CheckCircle className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p>Nenhum serviço concluído ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {completedServices?.map((service) => (
              <div key={service.serviceRequestId} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-medium text-gray-900">{service.serviceTitle}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Concluído
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{service.clientName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Concluído em {formatDate(service.completedAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium text-green-600">{formatCurrency(service.amount)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Transação: {service.transactionStatus}</span>
                      </div>
                    </div>

                    {/* Avaliação do Cliente */}
                    {service.hasReview ? (
                      <div className="bg-gray-50 rounded-lg p-3.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Avaliação do Cliente:</span>
                          <div className="flex items-center gap-1">
                            {renderStars(service.reviewRating || 0)}
                            <span className="text-xs sm:text-sm text-gray-600 ml-1">
                              ({service.reviewRating}/5)
                            </span>
                          </div>
                        </div>
                        {service.reviewComment && (
                          <p className="text-xs sm:text-sm text-gray-600 italic">"{service.reviewComment}"</p>
                        )}
                        <p className="text-[11px] text-gray-500 mt-1.5">
                          Avaliado em {formatDate(service.reviewCreatedAt || '')}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 rounded-lg p-3.5">
                        <p className="text-xs sm:text-sm text-yellow-700">
                          ⏳ Aguardando avaliação do cliente
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
