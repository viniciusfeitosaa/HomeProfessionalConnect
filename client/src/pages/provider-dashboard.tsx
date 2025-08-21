import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  DollarSign, TrendingUp, Calendar, Users, MapPin, Search, 
  MessageCircle, Clock, Star, Filter, Navigation, Zap,
  BarChart3, PieChart, Target, Award, Bell, Settings,
  ChevronDown, User, Shield, HelpCircle, LogOut, Moon, Sun,
  X, CheckCircle, AlertCircle, Info, Heart, RefreshCw, Phone, Mail,
  MessageSquare, Send, FileText
} from "lucide-react";

import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { ProviderLayout } from "@/components/ProviderLayout";
import ProfessionalDashboard from "@/components/professional-dashboard";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getApiUrl } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Bibliotecas para geração de PDF
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jsPDF from "jspdf";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import autoTable from "jspdf-autotable";

// Componente para controlar o mapa e centralizar na localização do usuário
function MapController({ userLocation }: { userLocation: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (map && userLocation) {
      console.log('🗺️ Centralizando mapa em:', userLocation);
      map.setView(userLocation, 15); // Zoom mais próximo para melhor precisão
    }
  }, [map, userLocation]);
  
  return null;
}

export default function ProviderDashboard() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null); // Sem fallback inicial
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);
  const [geolocationSupported, setGeolocationSupported] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedMapService, setSelectedMapService] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [mapKey, setMapKey] = useState(0); // Para forçar re-render do mapa
  const [locationUpdated, setLocationUpdated] = useState(false); // Para indicar se a localização foi atualizada
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null); // Precisão da localização
  const [providerAppointments, setProviderAppointments] = useState<any[]>([]);
  const [monthlyCompletedServices, setMonthlyCompletedServices] = useState<number>(0);
  const [monthlyCompletedEarnings, setMonthlyCompletedEarnings] = useState<number>(0);
  const [totalCompletedServices, setTotalCompletedServices] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [completedServices, setCompletedServices] = useState<any[]>([]);
  const [monthlyGoalMode, setMonthlyGoalMode] = useState<'services' | 'revenue'>(() => {
    const saved = localStorage.getItem('lb_monthly_goal_mode');
    return (saved === 'revenue' || saved === 'services') ? saved : 'services';
  });
  const [monthlyGoalServices, setMonthlyGoalServices] = useState<number>(() => {
    const saved = localStorage.getItem('lb_monthly_goal_services');
    const n = saved ? parseInt(saved) : 20;
    return Number.isFinite(n) && n > 0 ? n : 20;
  });
  const [monthlyGoalRevenue, setMonthlyGoalRevenue] = useState<number>(() => {
    const saved = localStorage.getItem('lb_monthly_goal_revenue');
    const n = saved ? parseFloat(saved) : 5000;
    return Number.isFinite(n) && n > 0 ? n : 5000;
  });
  // Dados para relatório (CPF/CNPJ e período)
  const [taxpayerId, setTaxpayerId] = useState<string>(() => localStorage.getItem('lb_report_taxpayer_id') || '');
  const [periodStart, setPeriodStart] = useState<string>(() => {
    const saved = localStorage.getItem('lb_report_start');
    if (saved) return saved;
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    return start.toISOString().slice(0, 10);
  });
  const [periodEnd, setPeriodEnd] = useState<string>(() => {
    const saved = localStorage.getItem('lb_report_end');
    if (saved) return saved;
    const d = new Date();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return end.toISOString().slice(0, 10);
  });
  
  // Gerar relatório em PDF (sóbrio, com período/CPF/CNPJ)
  const handleGenerateMonthlyReport = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 48;
      let cursorY = 56;

      doc.setTextColor(33, 33, 33);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(16);
      doc.text('Relatório de Ganhos', marginX, cursorY);
      cursorY += 14;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(`Período: ${new Date(periodStart).toLocaleDateString('pt-BR')} a ${new Date(periodEnd).toLocaleDateString('pt-BR')}`, marginX, cursorY);
      cursorY += 14;

      doc.setDrawColor(180, 180, 180);
      doc.line(marginX, cursorY, 595 - marginX, cursorY);
      cursorY += 16;

      doc.setFontSize(11);
      doc.setTextColor(33, 33, 33);
      doc.text(`Profissional: ${user?.name || 'Profissional'}`, marginX, cursorY); cursorY += 14;
      if (taxpayerId) { doc.text(`CPF/CNPJ: ${taxpayerId}`, marginX, cursorY); cursorY += 14; }
      doc.text(`Meta de receita: R$ ${monthlyGoalRevenue.toLocaleString('pt-BR')}`, marginX, cursorY); cursorY += 14;

      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      // Usar dados dos serviços concluídos em vez de appointments
      const completedRows = completedServices
        .filter((service: any) => {
          const serviceDate = service.completedAt ? new Date(service.completedAt) : null;
          return serviceDate && serviceDate >= start && serviceDate <= end;
        })
        .sort((a: any, b: any) => {
          const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
          const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
          return dateA.getTime() - dateB.getTime();
        });

      const summaryServices = completedRows.length;
      const summaryRevenue = completedRows.reduce((sum: number, service: any) => {
        return sum + (Number(service.amount) || 0);
      }, 0);

      doc.text(`Serviços concluídos no período: ${summaryServices}`, marginX, cursorY); cursorY += 14;
      doc.text(`Receita no período: R$ ${summaryRevenue.toLocaleString('pt-BR')}`, marginX, cursorY); cursorY += 10;

      const rows = completedRows.map((service: any) => {
        const dateStr = service.completedAt ? new Date(service.completedAt).toLocaleDateString('pt-BR') : 'Data não informada';
        const serviceStr = service.serviceTitle || 'Serviço';
        const amount = Number(service.amount) || 0;
        return [dateStr, serviceStr, `R$ ${amount.toLocaleString('pt-BR')}`];
      });

      // @ts-ignore
      autoTable(doc, {
        head: [["Data", "Serviço (apenas nome)", "Valor (R$)"]],
        body: rows,
        startY: cursorY + 10,
        styles: { fontSize: 10, textColor: [33,33,33], lineColor: [200,200,200], lineWidth: 0.5 },
        headStyles: { fillColor: [240,240,240], textColor: [33,33,33], lineColor: [200,200,200] },
        columnStyles: { 2: { halign: 'right' } },
        margin: { left: marginX, right: marginX },
      });

      const footerY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 24 : cursorY + 60;
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('Documento gerado automaticamente pelo LifeBee.', marginX, footerY);

      const periodName = `${new Date(periodStart).toLocaleDateString('pt-BR')}__${new Date(periodEnd).toLocaleDateString('pt-BR')}`.replace(/[\\/]/g, '-');
      doc.save(`Relatorio-Ganhos-${periodName}.pdf`);
    } catch (e) {
      alert('Não foi possível gerar o relatório agora. Tente novamente.');
    }
  };

  // Recriar o mapa quando o tema mudar para aplicar o basemap inicial correto
  useEffect(() => {
    setMapKey((k) => k + 1);
  }, [theme]);

  // Persistir metas no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lb_monthly_goal_mode', monthlyGoalMode);
      localStorage.setItem('lb_monthly_goal_services', String(monthlyGoalServices));
      localStorage.setItem('lb_monthly_goal_revenue', String(monthlyGoalRevenue));
    } catch {}
  }, [monthlyGoalMode, monthlyGoalServices, monthlyGoalRevenue]);

  // Persistir dados do relatório
  useEffect(() => {
    try {
      localStorage.setItem('lb_report_taxpayer_id', taxpayerId);
      if (periodStart) localStorage.setItem('lb_report_start', periodStart);
      if (periodEnd) localStorage.setItem('lb_report_end', periodEnd);
    } catch {}
  }, [taxpayerId, periodStart, periodEnd]);

  // Buscar agendamentos do profissional e calcular métricas do mês
  useEffect(() => {
    const fetchProviderAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${getApiUrl()}/api/appointments/provider`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!resp.ok) {
          return;
        }
        const data = await resp.json();
        setProviderAppointments(Array.isArray(data) ? data : []);

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const completedThisMonth = (Array.isArray(data) ? data : []).filter((a: any) => {
          const d = a.scheduledFor ? new Date(a.scheduledFor) : (a.createdAt ? new Date(a.createdAt) : null);
          const status = (a.status || '').toString();
          return d && d >= start && d <= end && status === 'completed';
        });

        const totalServices = completedThisMonth.length;
        const totalEarnings = completedThisMonth.reduce((sum: number, a: any) => {
          const v = typeof a.totalCost === 'string' ? parseFloat(a.totalCost) : Number(a.totalCost || 0);
          return sum + (Number.isFinite(v) ? v : 0);
        }, 0);

        setMonthlyCompletedServices(totalServices);
        setMonthlyCompletedEarnings(totalEarnings);
      } catch (e) {
        // Silencia falha
      }
    };
    fetchProviderAppointments();
  }, []);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.profileImage]);

  // Verificar se geolocalização está disponível
  useEffect(() => {
    const isSupported = "geolocation" in navigator;
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    setGeolocationSupported(isSupported);
    console.log('📍 Geolocalização suportada:', isSupported);
    console.log('📍 Contexto seguro (HTTPS/localhost):', isSecure);
    console.log('📍 Protocolo atual:', window.location.protocol);
    console.log('📍 Hostname atual:', window.location.hostname);
  }, []);

  // Monitorar mudanças na localização do usuário
  useEffect(() => {
    console.log('📍 Localização do usuário atualizada:', userLocation);
  }, [userLocation]);

  // Ativar geolocalização automaticamente quando a página carrega
  useEffect(() => {
    if (geolocationSupported && !userLocation && !locationLoading) {
      console.log('📍 Ativando geolocalização automática...');
      getUserLocation();
    }
  }, [geolocationSupported, userLocation, locationLoading]);

  // Dashboard Analytics Data - será carregado da API
  const analytics = {
    monthlyEarnings: 0,
    totalServices: 0,
    averageRating: 0,
    responseTime: "0min",
    monthlyGrowth: 0,
    servicesThisWeek: 0,
    nextAppointment: "Nenhum agendamento"
  };

  // Nearby Service Requests - será carregado da API
  const [nearbyServices, setNearbyServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [serviceLocations, setServiceLocations] = useState<{[key: number]: [number, number]}>({});
  const [editingLocation, setEditingLocation] = useState<number | null>(null);
  const [geocodingErrors, setGeocodingErrors] = useState<string[]>([]);
  const [geoContext, setGeoContext] = useState<{ city?: string; state?: string; stateCode?: string } | null>(null);

  // Recent Performance Data - será carregado da API
  const monthlyData: any[] = [];

  // Notifications Data - será carregado da API
  const notifications: any[] = [];

  const unreadCount = 0;



  const handleOfferService = (serviceId: number) => {
    setSelectedService(serviceId);
    // Navegar para a página de oferta de serviço
    window.location.href = `/service-offer/${serviceId}`;
  };

  const handleMapServiceClick = (service: any) => {
    setSelectedMapService(service);
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setSelectedMapService(null);
  };

  const handleClearSelection = () => {
    setSelectedMapService(null);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleAvailabilityChange = async (available: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Erro",
          description: "Token de autenticação não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/provider/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available })
      });

      if (response.ok) {
        setIsAvailable(available);
        toast({
          title: available ? "Disponível" : "Indisponível",
          description: available 
            ? "Você está agora disponível para receber solicitações de serviço."
            : "Você está agora indisponível. Os clientes não verão seu perfil.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar sua disponibilidade.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor.",
        variant: "destructive",
      });
    }
  };

  const markNotificationAsRead = (notificationId: number) => {
    // Em uma implementação real, você faria uma chamada para a API
    console.log(`Marking notification ${notificationId} as read`);
  };



  // Função para converter endereço em coordenadas usando geocoding real
  // Função para calcular distância entre duas coordenadas (fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Mapeamento local de endereços conhecidos de diferentes cidades
  const knownAddresses: {[key: string]: [number, number]} = {
    // São Paulo
    'rua das flores, 150, vila madalena, são paulo, sp': [-23.5500, -46.6800],
    'av. albert einstein, 627, morumbi, são paulo, sp': [-23.6200, -46.7200],
    'rua harmonia, 456, vila madalena, são paulo, sp': [-23.5500, -46.6800],
    'rua dos pinheiros, 789, pinheiros, são paulo, sp': [-23.5671, -46.7034],
    'rua dona adma jafet, 91, bela vista, são paulo, sp': [-23.5600, -46.6500],
    'av. paulista, 1000, bela vista, são paulo, sp': [-23.5600, -46.6600],
    
    // Endereços comuns de São Paulo
    'av. paulista, são paulo, sp': [-23.5600, -46.6600],
    'rua augusta, jardins, são paulo, sp': [-23.5600, -46.6600],
    'rua harmonia, vila madalena, são paulo, sp': [-23.5500, -46.6800],
    'rua das flores, vila madalena, são paulo, sp': [-23.5500, -46.6800],
    'rua dos pinheiros, pinheiros, são paulo, sp': [-23.5671, -46.7034],
    'rua dona adma jafet, bela vista, são paulo, sp': [-23.5600, -46.6500],
    'av. brigadeiro faria lima, são paulo, sp': [-23.5900, -46.6800],
    'shopping morumbi, são paulo, sp': [-23.6200, -46.7200],
    'hospital albert einstein, são paulo, sp': [-23.6200, -46.7200],
    'hospital sírio-libanês, são paulo, sp': [-23.5600, -46.6500],
    
    // Bairros de São Paulo
    'vila madalena, são paulo, sp': [-23.5500, -46.6800],
    'jardins, são paulo, sp': [-23.5600, -46.6600],
    'morumbi, são paulo, sp': [-23.6200, -46.7200],
    'itaim bibi, são paulo, sp': [-23.6000, -46.6800],
    'moema, são paulo, sp': [-23.6000, -46.6600],
    'pinheiros, são paulo, sp': [-23.5671, -46.7034],
    'vila mariana, são paulo, sp': [-23.5900, -46.6300],
    'centro, são paulo, sp': [-23.5505, -46.6333],
    'sé, são paulo, sp': [-23.5505, -46.6333],
    'republica, são paulo, sp': [-23.5400, -46.6400],
    'bela vista, são paulo, sp': [-23.5600, -46.6500],
    'consolação, são paulo, sp': [-23.5600, -46.6600],
    'liberdade, são paulo, sp': [-23.5600, -46.6400],
    'bom retiro, são paulo, sp': [-23.5300, -46.6400],
    'brás, são paulo, sp': [-23.5400, -46.6200],
    'cambuci, são paulo, sp': [-23.5700, -46.6200],
    'tatuapé, são paulo, sp': [-23.5400, -46.5700],
    'vila prudente, são paulo, sp': [-23.5800, -46.5800],
    'mooca, são paulo, sp': [-23.5500, -46.6000],
    'belenzinho, são paulo, sp': [-23.5400, -46.6200],
    'penha, são paulo, sp': [-23.5200, -46.5400],
    'santana, são paulo, sp': [-23.5000, -46.6400],
    'tucuruvi, são paulo, sp': [-23.4800, -46.6200],
    'casa verde, são paulo, sp': [-23.5100, -46.6600],
    'vila guilherme, são paulo, sp': [-23.5200, -46.6100],
    'lapa, são paulo, sp': [-23.5200, -46.7000],
    'perdizes, são paulo, sp': [-23.5300, -46.6800],
    'vila pompeia, são paulo, sp': [-23.5400, -46.6800],
    'butantã, são paulo, sp': [-23.5700, -46.7200],
    'jabaquara, são paulo, sp': [-23.6500, -46.6400],
    'santo amaro, são paulo, sp': [-23.6500, -46.7200],
    'campo belo, são paulo, sp': [-23.6100, -46.6800],
    'vila olímpia, são paulo, sp': [-23.6000, -46.6900],
    'brooklin, são paulo, sp': [-23.6100, -46.7000],
    'vila andrade, são paulo, sp': [-23.6300, -46.7200],
    'jardim paulista, são paulo, sp': [-23.5700, -46.6700],
    'jardim europa, são paulo, sp': [-23.5700, -46.6800],
    'jardim paulistano, são paulo, sp': [-23.5800, -46.6800],
    'alto de pinheiros, são paulo, sp': [-23.5700, -46.7100],
    'vila leopoldina, são paulo, sp': [-23.5300, -46.7300],
    'barra funda, são paulo, sp': [-23.5200, -46.6600],
    'campos elíseos, são paulo, sp': [-23.5400, -46.6500],
    'santa cecília, são paulo, sp': [-23.5400, -46.6600],
    'vila buarque, são paulo, sp': [-23.5400, -46.6500],
    'higienópolis, são paulo, sp': [-23.5500, -46.6600],
    'pacifica, são paulo, sp': [-23.5500, -46.6700],
    'vila romana, são paulo, sp': [-23.5400, -46.6900],
    'sumaré, são paulo, sp': [-23.5500, -46.6700],
    'agua branca, são paulo, sp': [-23.5200, -46.6800],
    'vila nova cachoeirinha, são paulo, sp': [-23.4900, -46.6700],
    'limão, são paulo, sp': [-23.5000, -46.6500],
    'brasilândia, são paulo, sp': [-23.4700, -46.6400],
    'freguesia do ó, são paulo, sp': [-23.5200, -46.7000],
    
    // Fortaleza
    'rua leão xiii, 431, serrinha, fortaleza, ce': [-3.7319, -38.5267],
    'rua leão xiii, serrinha, fortaleza, ce': [-3.7319, -38.5267],
    'leão xiii, serrinha, fortaleza, ce': [-3.7319, -38.5267],
    'serrinha, fortaleza, ce': [-3.7319, -38.5267],
    'avenida beira mar, fortaleza, ce': [-3.7319, -38.5267],
    'praça do ferreira, fortaleza, ce': [-3.7319, -38.5267],
    'centro, fortaleza, ce': [-3.7319, -38.5267],
    'aldeota, fortaleza, ce': [-3.7319, -38.5267],
    'meireles, fortaleza, ce': [-3.7319, -38.5267],
    'dionísio torres, fortaleza, ce': [-3.7319, -38.5267],
    'papicu, fortaleza, ce': [-3.7319, -38.5267],
    'cocó, fortaleza, ce': [-3.7319, -38.5267],
    'varjota, fortaleza, ce': [-3.7319, -38.5267],
    'montese, fortaleza, ce': [-3.7319, -38.5267],
    'fátima, fortaleza, ce': [-3.7319, -38.5267],
    'joaquim távora, fortaleza, ce': [-3.7319, -38.5267],
    'benfica, fortaleza, ce': [-3.7319, -38.5267],
    'damas, fortaleza, ce': [-3.7319, -38.5267],
    'são gerardo, fortaleza, ce': [-3.7319, -38.5267],
    'parangaba, fortaleza, ce': [-3.7319, -38.5267],
    'messejana, fortaleza, ce': [-3.7319, -38.5267],
    'conjunto ceará, fortaleza, ce': [-3.7319, -38.5267],
    'sabiguaba, fortaleza, ce': [-3.7319, -38.5267],
    
    // Outras cidades principais
    'copacabana, rio de janeiro, rj': [-22.9707, -43.1824],
    'ipanema, rio de janeiro, rj': [-22.9844, -43.2034],
    'centro, belo horizonte, mg': [-19.9167, -43.9345],
    'centro, salvador, ba': [-12.9714, -38.5011],
    'centro, recife, pe': [-8.0476, -34.8770],
    'centro, brasília, df': [-15.7942, -47.8822],
    'centro, curitiba, pr': [-25.4289, -49.2671],
    'centro, porto alegre, rs': [-30.0346, -51.2177],
    'centro, belém, pa': [-1.4554, -48.4898],
    'centro, manaus, am': [-3.1190, -60.0217],
  };

  // Cache para coordenadas já processadas
  const coordinatesCache = new Map<string, [number, number]>();
  
  // Limpar cache quando necessário (para debug)
  // coordinatesCache.clear();

  // Normaliza endereço para formato mais amigável ao Nominatim
  const normalizeAddress = (raw: string): string => {
    let a = String(raw || '').trim();
    // Unificar separadores: trocar " - " por ", "
    a = a.replace(/\s-\s/g, ', ');
    // Remover múltiplas vírgulas/espaços
    a = a.replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').replace(/,+/g, ',');
    // Remover rótulos comuns
    a = a.replace(/\bcep:?\s*\d{5}-?\d{3}\b/gi, '').replace(/\bbrasil\b/gi, '');
    // Remover vírgulas no fim
    a = a.replace(/,\s*$/g, '');
    return a;
  };

  // Extrai cidade/UF se presentes no texto
  const extractCityState = (addr: string): { city?: string; state?: string } => {
    const out: { city?: string; state?: string } = {};
    const ufMatch = addr.match(/\b([A-Za-zÀ-ÿ\s]+),\s*([A-Za-z]{2})\b/);
    if (ufMatch) {
      out.city = ufMatch[1].trim();
      out.state = ufMatch[2].trim().toUpperCase();
      return out;
    }
    // Padrão com hífens: Cidade - UF
    const hyphenMatch = addr.match(/\b([A-Za-zÀ-ÿ\s]+)\s*-\s*([A-Za-z]{2})\b/);
    if (hyphenMatch) {
      out.city = hyphenMatch[1].trim();
      out.state = hyphenMatch[2].trim().toUpperCase();
    }
    return out;
  };

  // Monta URL do Nominatim com viés para região atual do profissional
  const buildNominatimUrl = (q: string): string => {
    const base = 'https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=br&addressdetails=1&accept-language=pt-BR';
    if (userLocation) {
      const [lat, lng] = userLocation;
      const delta = 0.3; // ~33km para viés mais preciso
      const left = (lng - delta).toFixed(6);
      const right = (lng + delta).toFixed(6);
      const top = (lat + delta).toFixed(6);
      const bottom = (lat - delta).toFixed(6);
      return `${base}&q=${encodeURIComponent(q)}&viewbox=${left},${top},${right},${bottom}&bounded=1`;
    }
    return `${base}&q=${encodeURIComponent(q)}`;
  };

  const getAddressCoordinates = async (
    address: string,
    options?: { allowFallback?: boolean }
  ): Promise<[number, number] | null> => {
    try {
      // Verificar cache primeiro
      if (coordinatesCache.has(address)) {
        const cachedCoords = coordinatesCache.get(address)!;
        console.log(`✅ Coordenadas encontradas no cache: "${address}" → [${cachedCoords[0]}, ${cachedCoords[1]}]`);
        return cachedCoords;
      }

      // Limpar e formatar o endereço
      const normalized = normalizeAddress(address);
      const cleanAddress = normalized.toLowerCase();
      const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const removeStreetNumber = (s: string) => s.replace(/\b\d+[\w\s\/\-]*?(?=,|$)/g, '').replace(/,\s*,/g, ',').replace(/,\s*$/, '').trim();
      const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
      const baseAddressVariants = uniq([
        cleanAddress,
        stripAccents(cleanAddress),
        removeStreetNumber(cleanAddress),
        stripAccents(removeStreetNumber(cleanAddress)),
      ]);
      
      // 1. Busca exata no mapeamento local
      for (const [key, coords] of Object.entries(knownAddresses)) {
        if (cleanAddress === key) {
          coordinatesCache.set(address, coords);
          console.log(`✅ Busca exata no mapeamento local: "${address}" → [${coords[0]}, ${coords[1]}]`);
          return coords;
        }
      }
      
      // 2. Busca por endereços que contêm palavras-chave específicas
      const specificKeywords = ['rua leão xiii', 'serrinha', 'fortaleza'];
      for (const keyword of specificKeywords) {
        if (cleanAddress.includes(keyword)) {
          for (const [key, coords] of Object.entries(knownAddresses)) {
            if (key.includes(keyword)) {
              coordinatesCache.set(address, coords);
              console.log(`✅ Busca por palavra-chave "${keyword}": "${address}" → [${coords[0]}, ${coords[1]}]`);
              return coords;
            }
          }
        }
      }
      
      // 3. Busca parcial no mapeamento local (mais inteligente)
      let bestMatch: { key: string; coords: [number, number]; score: number } | null = null;
      
      for (const [key, coords] of Object.entries(knownAddresses)) {
        const score = calculateAddressSimilarity(cleanAddress, key);
        if (score > 0.6 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { key, coords, score };
        }
      }
      
      if (bestMatch) {
        coordinatesCache.set(address, bestMatch.coords);
        console.log(`✅ Busca parcial no mapeamento local: "${address}" → "${bestMatch.key}" (score: ${bestMatch.score.toFixed(2)}) → [${bestMatch.coords[0]}, ${bestMatch.coords[1]}]`);
        return bestMatch.coords;
      }
      
      // 3. Detectar cidade e estado do endereço
      const cs = extractCityState(normalized);
      const cityStateMatch = cleanAddress.match(/([^,]+),\s*([a-z]{2})/);
      let city = '';
      let state = '';
      
      if (cs.city && cs.state) {
        city = cs.city;
        state = cs.state;
      } else if (cityStateMatch) {
        city = cityStateMatch[1].trim();
        state = cityStateMatch[2].trim().toUpperCase();
      }
      
      // 4. Geocoding externo com múltiplas tentativas baseadas na cidade detectada
      const searchQueries: string[] = [];
      
      if (city && state) {
        // Tentativas específicas para a cidade detectada
        baseAddressVariants.forEach((base) => {
          searchQueries.push(
            base + ', ' + city + ', ' + state + ', brasil',
            base + ', ' + city + ', ' + state,
            base + ', ' + state + ', brasil',
            base + ', brasil'
          );
        });
      } else {
        // Sem cidade/estado no endereço: tentar com o contexto local do profissional (reverse geocoding) se disponível
        const ctxCity = geoContext?.city ? String(geoContext.city).toLowerCase() : '';
        const ctxState = geoContext?.stateCode || (geoContext?.state ? String(geoContext.state).toUpperCase() : '');
        if (ctxCity && ctxState) {
          baseAddressVariants.forEach((base) => {
            searchQueries.push(
              base + ', ' + ctxCity + ', ' + ctxState + ', brasil',
              base + ', ' + ctxCity + ', ' + ctxState,
              base + ', ' + ctxState + ', brasil',
              base + ', brasil'
            );
          });
        } else {
          // Tentativas genéricas
          baseAddressVariants.forEach((base) => {
            searchQueries.push(
              base + ', brasil',
              base
            );
          });
        }
      }
      
      // Remover duplicados preservando ordem
      const finalQueries = uniq(searchQueries);

      for (const query of finalQueries) {
        try {
          console.log(`🌐 Tentando geocoding externo para: "${query}"`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000); // 7 segundos timeout
          
          const url = buildNominatimUrl(query);
          const response = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
          
          clearTimeout(timeoutId);
          
              if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                  // Preferir resultados na mesma cidade/UF quando disponíveis
                  const prefer = (item: any) => {
                    const a = item.address || {};
                    const icCity = (a.city || a.town || a.village || a.suburb || '').toString().toLowerCase();
                    const icState = (a.state || '').toString().toUpperCase();
                    let score = parseFloat(item.importance || 0);
                    if (city && icCity.includes(city.toLowerCase())) score += 0.5;
                    if (state && icState === state.toUpperCase()) score += 0.5;
                    // Peso por proximidade do profissional, quando disponível (até +0.5)
                    if (userLocation) {
                      const dKm = calculateDistance(parseFloat(item.lat), parseFloat(item.lon), userLocation[0], userLocation[1]);
                      const proximity = Math.max(0, 50 - dKm) / 100; // 0 a 0.5 para até 50km
                      score += proximity;
                    }
                    return score;
                  };
                  const bestResult = data.reduce((best: any, current: any) => {
                    return prefer(current) > prefer(best) ? current : best;
                  });
                  const lat = parseFloat(bestResult.lat);
                  const lon = parseFloat(bestResult.lon);
                  if (isValidBrazilCoordinates(lat, lon)) {
                    const coords: [number, number] = [lat, lon];
                    coordinatesCache.set(address, coords);
                    console.log(`✅ Geocoding externo bem-sucedido para "${address}": [${lat}, ${lon}] (ajustado por contexto)`);
                    return coords;
                  } else {
                    console.log(`⚠️ Coordenadas inválidas para "${address}": [${lat}, ${lon}]`);
                  }
                }
              }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.warn(`⏰ Timeout na tentativa "${query}"`);
          } else {
            console.warn(`❌ Erro na tentativa "${query}":`, error);
          }
        }
      }
      
      // 5. Fallback inteligente baseado na cidade detectada
      if (options?.allowFallback === false) {
        console.log(`🔄 Fallback desabilitado para "${address}". Retornando null.`);
        return null;
      }
      const fallbackCoords = getIntelligentFallbackByCity(cleanAddress, city, state);
      coordinatesCache.set(address, fallbackCoords);
      console.log(`🔄 Usando fallback inteligente para "${address}": [${fallbackCoords[0].toFixed(6)}, ${fallbackCoords[1].toFixed(6)}]`);
      return fallbackCoords;
      
    } catch (error) {
      console.error('Erro geral no geocoding:', error);
      
      if (options?.allowFallback === false) {
        console.log(`🔄 Fallback final desabilitado para "${address}". Retornando null.`);
        return null;
      }
      // Fallback final: centro do Brasil
      const fallbackCoords: [number, number] = [-15.7942, -47.8822]; // Brasília
      coordinatesCache.set(address, fallbackCoords);
      console.log(`🔄 Fallback final para "${address}": centro do Brasil`);
      return fallbackCoords;
    }
  };

  // Função para calcular similaridade entre endereços
  const calculateAddressSimilarity = (addr1: string, addr2: string): number => {
    const words1 = addr1.split(' ').filter(w => w.length > 2);
    const words2 = addr2.split(' ').filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    // Verificar se o endereço contém palavras-chave importantes
    const importantWords = ['rua', 'avenida', 'fortaleza', 'serrinha', 'leão', 'xiii'];
    const hasImportantWords = importantWords.some(word => 
      addr1.includes(word) && addr2.includes(word)
    );
    
    const commonWords = words1.filter(word => 
      words2.some(w2 => w2.includes(word) || word.includes(w2))
    );
    
    let score = commonWords.length / Math.max(words1.length, words2.length);
    
    // Bonus para endereços que contêm palavras-chave importantes
    if (hasImportantWords) {
      score += 0.3;
    }
    
    return Math.min(score, 1.0);
  };

  // Função para validar coordenadas do Brasil
  const isValidBrazilCoordinates = (lat: number, lon: number): boolean => {
    // Coordenadas aproximadas do Brasil
    return lat >= -34.0 && lat <= 6.0 && lon >= -74.0 && lon <= -34.0;
  };

  // Função para validar coordenadas de São Paulo
  const isValidSaoPauloCoordinates = (lat: number, lon: number): boolean => {
    // Limites mais precisos de São Paulo
    return lat >= -24.0 && lat <= -23.3 && lon >= -47.2 && lon <= -46.0;
  };

  // Função para fallback inteligente baseado na cidade detectada
  const getIntelligentFallbackByCity = (address: string, city: string, state: string): [number, number] => {
    // Mapeamento de cidades para coordenadas aproximadas
    const cityCoords: {[key: string]: [number, number]} = {
      // São Paulo
      'são paulo': [-23.5505, -46.6333],
      'sp': [-23.5505, -46.6333],
      
      // Fortaleza - Prioridade alta
      'fortaleza': [-3.7319, -38.5267],
      'ce': [-3.7319, -38.5267],
      'serrinha': [-3.7319, -38.5267],
      
      // Outras cidades principais
      'rio de janeiro': [-22.9068, -43.1729],
      'rj': [-22.9068, -43.1729],
      'belo horizonte': [-19.9167, -43.9345],
      'mg': [-19.9167, -43.9345],
      'salvador': [-12.9714, -38.5011],
      'ba': [-12.9714, -38.5011],
      'recife': [-8.0476, -34.8770],
      'pe': [-8.0476, -34.8770],
      'brasília': [-15.7942, -47.8822],
      'df': [-15.7942, -47.8822],
      'curitiba': [-25.4289, -49.2671],
      'pr': [-25.4289, -49.2671],
      'porto alegre': [-30.0346, -51.2177],
      'rs': [-30.0346, -51.2177],
      'belém': [-1.4554, -48.4898],
      'pa': [-1.4554, -48.4898],
      'manaus': [-3.1190, -60.0217],
      'am': [-3.1190, -60.0217],
    };

    // Verificar especificamente por Fortaleza primeiro
    if (address.includes('fortaleza') || address.includes('ce') || address.includes('serrinha') || 
        city.includes('fortaleza') || city.includes('ce') || city.includes('serrinha') ||
        state.includes('CE')) {
      console.log(`🎯 Detecção específica de Fortaleza para: "${address}"`);
      return [-3.7319, -38.5267];
    }

    // Tentar encontrar cidade no endereço
    for (const [cityKey, coords] of Object.entries(cityCoords)) {
      if (address.includes(cityKey) || city.includes(cityKey) || state.includes(cityKey)) {
        return coords;
      }
    }

    // Se não encontrar cidade específica, usar hash para variação no centro do Brasil
    const hash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const latVariation = (Math.abs(hash) % 2000) / 10000 - 0.1; // ±0.1 graus
    const lngVariation = (Math.abs(hash >> 10) % 2000) / 10000 - 0.1; // ±0.1 graus
    
    return [
      -15.7942 + latVariation, // Centro do Brasil (Brasília) + variação
      -47.8822 + lngVariation
    ];
  };

  // Função para fallback inteligente baseado no endereço (mantida para compatibilidade)
  const getIntelligentFallback = (address: string): [number, number] => {
    // Mapeamento de bairros para coordenadas aproximadas
    const bairroCoords: {[key: string]: [number, number]} = {
      'vila madalena': [-23.5500, -46.6800],
      'pinheiros': [-23.5671, -46.7034],
      'bela vista': [-23.5600, -46.6500],
      'jardins': [-23.5600, -46.6600],
      'morumbi': [-23.6200, -46.7200],
      'itaim bibi': [-23.6000, -46.6800],
      'moema': [-23.6000, -46.6600],
      'vila mariana': [-23.5900, -46.6300],
      'centro': [-23.5505, -46.6333],
      'sé': [-23.5505, -46.6333],
      'republica': [-23.5400, -46.6400],
      'consolação': [-23.5600, -46.6600],
      'liberdade': [-23.5600, -46.6400],
      'bom retiro': [-23.5300, -46.6400],
      'brás': [-23.5400, -46.6200],
      'cambuci': [-23.5700, -46.6200],
      'tatuapé': [-23.5400, -46.5700],
      'vila prudente': [-23.5800, -46.5800],
      'mooca': [-23.5500, -46.6000],
      'belenzinho': [-23.5400, -46.6200],
      'penha': [-23.5200, -46.5400],
      'santana': [-23.5000, -46.6400],
      'tucuruvi': [-23.4800, -46.6200],
      'casa verde': [-23.5100, -46.6600],
      'vila guilherme': [-23.5200, -46.6100],
      'lapa': [-23.5200, -46.7000],
      'perdizes': [-23.5300, -46.6800],
      'vila pompeia': [-23.5400, -46.6800],
      'butantã': [-23.5700, -46.7200],
      'jabaquara': [-23.6500, -46.6400],
      'santo amaro': [-23.6500, -46.7200],
      'campo belo': [-23.6100, -46.6800],
      'vila olímpia': [-23.6000, -46.6900],
      'brooklin': [-23.6100, -46.7000],
      'vila andrade': [-23.6300, -46.7200],
      'jardim paulista': [-23.5700, -46.6700],
      'jardim europa': [-23.5700, -46.6800],
      'jardim paulistano': [-23.5800, -46.6800],
      'alto de pinheiros': [-23.5700, -46.7100],
      'vila leopoldina': [-23.5300, -46.7300],
      'barra funda': [-23.5200, -46.6600],
      'campos elíseos': [-23.5400, -46.6500],
      'santa cecília': [-23.5400, -46.6600],
      'vila buarque': [-23.5400, -46.6500],
      'higienópolis': [-23.5500, -46.6600],
      'pacifica': [-23.5500, -46.6700],
      'vila romana': [-23.5400, -46.6900],
      'sumaré': [-23.5500, -46.6700],
      'agua branca': [-23.5200, -46.6800],
      'vila nova cachoeirinha': [-23.4900, -46.6700],
      'limão': [-23.5000, -46.6500],
      'brasilândia': [-23.4700, -46.6400],
      'freguesia do ó': [-23.5200, -46.7000],
    };

    // Tentar encontrar bairro no endereço
    for (const [bairro, coords] of Object.entries(bairroCoords)) {
      if (address.includes(bairro)) {
        return coords;
      }
    }

    // Se não encontrar bairro específico, usar hash para variação no centro
    const hash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const latVariation = (Math.abs(hash) % 1500) / 10000 - 0.075; // ±0.075 graus
    const lngVariation = (Math.abs(hash >> 10) % 1500) / 10000 - 0.075; // ±0.075 graus
    
    return [
      -23.5505 + latVariation, // Centro de São Paulo + variação menor
      -46.6333 + lngVariation
    ];
  };

  // Buscar estatísticas de performance do profissional
  const fetchPerformanceStats = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Buscar serviços concluídos do profissional
      const response = await fetch(`${getApiUrl()}/api/professional/${user.id}/completed-services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const completedServices = data.data || [];
        
        // Calcular estatísticas do mês atual
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyServices = completedServices.filter((service: any) => {
          const serviceDate = service.completedAt ? new Date(service.completedAt) : null;
          if (!serviceDate) return false;
          
          console.log('🔍 Filtro mensal:', {
            serviceId: service.serviceRequestId,
            completedAt: service.completedAt,
            serviceDate: serviceDate.toISOString(),
            currentMonth,
            currentYear,
            isCurrentMonth: serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear
          });
          return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear;
        });
        
        const monthlyEarnings = monthlyServices.reduce((total: number, service: any) => {
          return total + (Number(service.amount) || 0);
        }, 0);
        
        // Calcular totais gerais
        const totalEarnings = completedServices.reduce((total: number, service: any) => {
          return total + (Number(service.amount) || 0);
        }, 0);
        
        setMonthlyCompletedServices(monthlyServices.length);
        setMonthlyCompletedEarnings(monthlyEarnings);
        setTotalCompletedServices(completedServices.length);
        setTotalEarnings(totalEarnings);
        setCompletedServices(completedServices); // Salvar dados para o gráfico
        
        console.log('📊 Estatísticas carregadas:', {
          totalServices: completedServices.length,
          monthlyServices: monthlyServices.length,
          monthlyEarnings,
          totalEarnings,
          completedServices: completedServices.slice(0, 3) // Mostrar primeiros 3 serviços para debug
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  // Buscar solicitações de serviço disponíveis com melhor performance
  const fetchServiceRequests = async () => {
    console.log('🚀 Iniciando busca de solicitações...');
    console.log('👤 Usuário:', user);
    
    if (!user) {
      console.log('❌ Usuário não autenticado');
      return;
    }
    
    setLoadingServices(true);
    setLoadingProgress(0);
    setLoadingMessage('Iniciando busca de solicitações...');
    setNearbyServices([]); // Limpar lista anterior
    setServiceLocations({}); // Limpar localizações anteriores
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token encontrado:', !!token);
      
      if (!token) {
        toast({
          title: "Erro de Autenticação",
          description: "Token de autenticação não encontrado. Faça login novamente.",
          variant: "destructive",
        });
        setLoadingServices(false);
        return;
      }

      // Buscar solicitações para todas as categorias que o profissional atende
      const categories = ['acompanhante_hospitalar'];
      const allRequests: any[] = [];
      let totalFound = 0;

      console.log('🌐 URL da API:', getApiUrl());
      console.log('🔑 Token presente:', !!token);

      // Buscar todas as categorias em paralelo para melhor performance
      const categoryPromises = categories.map(async (category) => {
        const url = `${getApiUrl()}/api/service-requests/category/${category}`;
        console.log(`📡 Buscando solicitações para categoria: ${category}`);
        console.log(`🔗 URL completa: ${url}`);
        
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`📊 Resposta para ${category}:`, response.status, response.statusText);
          
          if (response.ok) {
            const requests = await response.json();
            console.log(`✅ Solicitações encontradas para ${category}:`, requests);
            console.log(`📈 Quantidade de solicitações para ${category}:`, requests.length);
            totalFound += requests.length;
            return requests;
          } else {
            const errorText = await response.text();
            console.error(`❌ Erro na API para ${category}:`, errorText);
            console.error(`Status: ${response.status}, StatusText: ${response.statusText}`);
            return [];
          }
        } catch (error) {
          console.error(`💥 Erro na requisição para ${category}:`, error);
          return [];
        }
      });

      // Aguardar todas as requisições
      setLoadingProgress(30);
      setLoadingMessage('Buscando solicitações das categorias...');
      const results = await Promise.all(categoryPromises);
      results.forEach(categoryRequests => allRequests.push(...categoryRequests));

      console.log('📋 Total de solicitações encontradas:', allRequests.length);
      
      if (allRequests.length === 0) {
        setLoadingServices(false);
        toast({
          title: "Nenhuma solicitação encontrada",
          description: "Não há solicitações disponíveis no momento. Tente novamente mais tarde.",
        });
        return;
      }

      // Filtrar apenas solicitações abertas e ordenar por data de criação (mais recentes primeiro)
      const openRequests = allRequests
        .filter((request: any) => request.status === 'open')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('🔓 Solicitações abertas encontradas:', openRequests.length);
      setLoadingProgress(50);
      setLoadingMessage(`Processando ${openRequests.length} solicitações...`);
      setNearbyServices(openRequests);

      // Processar geocoding em lotes para melhor performance
      const locations: {[key: number]: [number, number]} = {};
      const geocodingErrors: string[] = [];
      const batchSize = 3; // Processar 3 endereços por vez
      
      for (let i = 0; i < openRequests.length; i += batchSize) {
        const batch = openRequests.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (request) => {
          const fullAddressRaw = (request as any).address || (request as any).location || '';
          const fullAddress = String(fullAddressRaw || '').trim();
          const lowered = fullAddress.toLowerCase();
          const isMissing = lowered === 'não informado' || lowered === 'nao informado' || lowered === 'não definido' || lowered === 'nao definido';
          if (fullAddress && !isMissing && fullAddress.length >= 5) {
            try {
              const coords = await getAddressCoordinates(fullAddress, { allowFallback: false });
              if (coords) {
                locations[request.id] = coords;
                console.log(`✅ Endereço geocodificado: ${fullAddress} → [${coords[0]}, ${coords[1]}]`);
              } else {
                geocodingErrors.push(fullAddress);
                console.warn(`❌ Falha no geocoding: ${fullAddress}`);
              }
            } catch (error) {
              geocodingErrors.push(fullAddress);
              console.error(`❌ Erro no geocoding para ${fullAddress}:`, error);
            }
          }
        });
        
        await Promise.all(batchPromises);
        
        // Atualizar progresso em tempo real
        const progress = 50 + Math.min(((i + batchSize) / openRequests.length) * 40, 40);
        setLoadingProgress(progress);
        setLoadingMessage(`Processando localizações... ${Math.round(((i + batchSize) / openRequests.length) * 100)}%`);
        console.log(`🔄 Progresso do geocoding: ${progress.toFixed(1)}%`);
      }
      
      setLoadingProgress(100);
      setLoadingMessage('Finalizando...');
      setServiceLocations(locations);
      setGeocodingErrors(geocodingErrors);
      
      // Feedback detalhado
      const withCoordinates = Object.keys(locations).length;
      const withoutCoordinates = openRequests.length - withCoordinates;
      
      console.log(`✅ Processamento concluído: ${openRequests.length} solicitações`);
      console.log(`📍 Com coordenadas: ${withCoordinates}`);
      console.log(`❓ Sem coordenadas: ${withoutCoordinates}`);
      
      if (geocodingErrors.length > 0) {
        toast({
          title: "Solicitações Carregadas!",
          description: `${openRequests.length} solicitações encontradas. ${withCoordinates} com localização precisa. ${geocodingErrors.length} com problemas de localização.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Solicitações Carregadas!",
          description: `${openRequests.length} solicitações encontradas. Todos os endereços foram localizados com sucesso!`,
          variant: "default",
        });
      }
      
    } catch (error) {
      console.error('💥 Erro geral ao buscar solicitações:', error);
      toast({
        title: "Erro de Conexão",
        description: "Erro ao carregar solicitações. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingServices(false);
    }
  };

  // Obter localização atual do usuário - aceita qualquer localização válida
  const getUserLocation = () => {
    console.log('📍 Iniciando geolocalização...');
    console.log('📍 Geolocalização suportada:', geolocationSupported);
    setLocationLoading(true);
    setLocationRequested(true);
    
    if (geolocationSupported) {
      console.log('📍 Geolocalização suportada pelo navegador');
      
      const options = {
        enableHighAccuracy: true, // Máxima precisão
        timeout: 30000, // 30 segundos
        maximumAge: 0 // Sempre obter nova localização
      };
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('📍 Localização obtida com sucesso:', { 
            latitude, 
            longitude, 
            accuracy: `${accuracy}m de precisão` 
          });
          
          // Validação básica - aceita qualquer coordenada válida
          if (latitude && longitude && 
              !isNaN(latitude) && !isNaN(longitude) &&
              latitude >= -90 && latitude <= 90 &&
              longitude >= -180 && longitude <= 180) {
            
            console.log('📍 Coordenadas válidas:', [latitude, longitude]);
            
            // Aceitar qualquer localização, incluindo VPN
            setUserLocation([latitude, longitude]);
            setLocationAccuracy(accuracy || 0);
            setMapKey(prev => prev + 1);
            setLocationLoading(false);
            setLocationUpdated(true);
            
            // Toast com informações detalhadas
            const accuracyLevel = accuracy <= 10 ? 'Excelente' : 
                                accuracy <= 30 ? 'Muito Boa' : 
                                accuracy <= 50 ? 'Boa' : 
                                accuracy <= 100 ? 'Regular' : 'Baixa';
            
            toast({
              title: `Localização ${accuracyLevel}`,
              description: `Precisão: ${Math.round(accuracy || 0)}m | ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            });
            
            // Forçar atualização do mapa com delay
            setTimeout(() => {
              setMapKey(prev => prev + 1);
            }, 200);
            
            // Resetar indicador
            setTimeout(() => {
              setLocationUpdated(false);
            }, 3000);

            // Reverse geocoding para obter cidade/UF do profissional e melhorar geocoding das solicitações
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&accept-language=pt-BR`, { signal: controller.signal });
              clearTimeout(timeoutId);
              if (resp.ok) {
                const data = await resp.json();
                const addr = data?.address || {};
                const city = addr.city || addr.town || addr.village || addr.suburb || '';
                const state = addr.state || '';
                const stateCode = addr['ISO3166-2-lvl4']?.split('-')?.pop?.() || addr['state_code'] || '';
                setGeoContext({ city, state, stateCode });
                console.log('🧭 Contexto geográfico detectado:', { city, state, stateCode });
              }
            } catch (e) {
              console.warn('⚠️ Falha no reverse geocoding do contexto local:', e);
            }
          } else {
            console.warn('📍 Coordenadas inválidas:', { latitude, longitude });
            setLocationLoading(false);
            toast({
              title: "Erro na Localização",
              description: "Coordenadas inválidas obtidas. Tente novamente.",
              variant: "destructive",
            });
          }
        },
        (error) => {
          console.error('📍 Erro na geolocalização:', error);
          
          let errorMessage = "Erro desconhecido na geolocalização";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permissão negada. Ative a localização nas configurações do navegador.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Localização indisponível. Verifique sua conexão de internet.";
              break;
            case error.TIMEOUT:
              errorMessage = "Tempo limite excedido. Tente novamente em alguns segundos.";
              break;
          }
          
          console.log(`📍 ${errorMessage}`);
          setLocationLoading(false);
          
          // Removido popup de erro de localização
        },
        options
      );
    } else {
      console.log('📍 Geolocalização não suportada pelo navegador');
      setLocationLoading(false);
      
      // Removido popup de geolocalização não suportada
    }
  };

  // Carregar solicitações de serviço quando o usuário estiver autenticado
  useEffect(() => {
    console.log('useEffect triggered - user:', user);
    if (user) {
      console.log('User authenticated, calling fetchServiceRequests');
      fetchServiceRequests();
      fetchPerformanceStats(); // Carregar estatísticas de performance
    } else {
      console.log('User not authenticated yet');
    }
  }, [user]);

  // Função para centralizar o mapa na localização do usuário
  const centerMapOnUser = () => {
    if (userLocation) {
      console.log('🗺️ Centralizando mapa na localização do usuário:', userLocation);
      setMapKey(prev => prev + 1);
      
      // Removido popup de mapa centralizado
    } else {
      // Removido popup de localização não disponível
    }
  };

  // Função para melhorar a precisão da geolocalização
  const improveLocationAccuracy = () => {
    console.log('🎯 Melhorando precisão da localização...');
    
    if (!geolocationSupported) {
      // Removido popup de geolocalização não suportada
      return;
    }

    setLocationLoading(true);
    
    // Configurações ultra-agressivas para máxima precisão
    const ultraHighAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 45000, // 45 segundos
      maximumAge: 0 // Sempre obter nova localização
    };

    // Primeira tentativa
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('🎯 Primeira tentativa:', { latitude, longitude, accuracy });
        
        if (accuracy <= 30) { // Precisão muito boa (≤30m)
          console.log('🎯 Precisão muito boa obtida:', accuracy + 'm');
          setUserLocation([latitude, longitude]);
          setLocationAccuracy(accuracy);
          setMapKey(prev => prev + 1);
          setLocationUpdated(true);
          
          // Removido popup de precisão excelente
          
          setLocationLoading(false);
          setTimeout(() => {
            setLocationUpdated(false);
          }, 3000);
        } else {
          // Segunda tentativa com delay
          console.log('🎯 Primeira tentativa imprecisa, tentando novamente...');
          
          setTimeout(() => {
            navigator.geolocation.getCurrentPosition(
              (secondPosition) => {
                const { latitude: lat2, longitude: lng2, accuracy: acc2 } = secondPosition.coords;
                console.log('🎯 Segunda tentativa:', { lat2, lng2, acc2 });
                
                // Terceira tentativa se ainda imprecisa
                if (acc2 > 50) {
                  console.log('🎯 Segunda tentativa imprecisa, tentando terceira vez...');
                  
                  setTimeout(() => {
                    navigator.geolocation.getCurrentPosition(
                      (thirdPosition) => {
                        const { latitude: lat3, longitude: lng3, accuracy: acc3 } = thirdPosition.coords;
                        console.log('🎯 Terceira tentativa:', { lat3, lng3, acc3 });
                        
                        // Usar a melhor das três tentativas
                        const positions = [
                          { lat: latitude, lng: longitude, acc: accuracy },
                          { lat: lat2, lng: lng2, acc: acc2 },
                          { lat: lat3, lng: lng3, acc: acc3 }
                        ];
                        
                        const bestPosition = positions.reduce((best, current) => 
                          current.acc < best.acc ? current : best
                        );
                        
                        console.log('🎯 Melhor precisão das 3 tentativas:', bestPosition.acc + 'm');
                        setUserLocation([bestPosition.lat, bestPosition.lng]);
                        setLocationAccuracy(bestPosition.acc);
                        setMapKey(prev => prev + 1);
                        setLocationUpdated(true);
                        
                        const accuracyLevel = bestPosition.acc <= 20 ? 'Excelente' : 
                                            bestPosition.acc <= 40 ? 'Muito Boa' : 'Aceitável';
                        
                        // Removido popup de localização otimizada
                        
                        setLocationLoading(false);
                        setTimeout(() => {
                          setLocationUpdated(false);
                        }, 3000);
                      },
                      (error) => {
                        console.error('🎯 Erro na terceira tentativa:', error);
                        // Usar a melhor das duas primeiras
                        const bestPosition = acc2 < accuracy ? 
                          { lat: lat2, lng: lng2, acc: acc2 } : 
                          { lat: latitude, lng: longitude, acc: accuracy };
                        
                        setUserLocation([bestPosition.lat, bestPosition.lng]);
                        setLocationAccuracy(bestPosition.acc);
                        setMapKey(prev => prev + 1);
                        setLocationUpdated(true);
                        
                        // Removido popup de localização obtida
                        
                        setLocationLoading(false);
                        setTimeout(() => {
                          setLocationUpdated(false);
                        }, 3000);
                      },
                      ultraHighAccuracyOptions
                    );
                  }, 2000);
                } else {
                  // Usar a melhor das duas tentativas
                  const bestPosition = acc2 < accuracy ? 
                    { lat: lat2, lng: lng2, acc: acc2 } : 
                    { lat: latitude, lng: longitude, acc: accuracy };
                  
                  console.log('🎯 Melhor precisão das 2 tentativas:', bestPosition.acc + 'm');
                  setUserLocation([bestPosition.lat, bestPosition.lng]);
                  setLocationAccuracy(bestPosition.acc);
                  setMapKey(prev => prev + 1);
                  setLocationUpdated(true);
                  
                  // Removido popup de localização otimizada
                  
                  setLocationLoading(false);
                  setTimeout(() => {
                    setLocationUpdated(false);
                  }, 3000);
                }
              },
              (error) => {
                console.error('🎯 Erro na segunda tentativa:', error);
                // Usar a primeira tentativa
                setUserLocation([latitude, longitude]);
                setLocationAccuracy(accuracy);
                setMapKey(prev => prev + 1);
                setLocationUpdated(true);
                
                // Removido popup de localização obtida
                
                setLocationLoading(false);
                setTimeout(() => {
                  setLocationUpdated(false);
                }, 3000);
              },
              ultraHighAccuracyOptions
            );
          }, 1500);
        }
      },
      (error) => {
        console.error('🎯 Erro na primeira tentativa:', error);
        setLocationLoading(false);
        
        // Removido popup de erro na localização
      },
      ultraHighAccuracyOptions
    );
  };

  return (
    <ProviderLayout>
      {/* Conteúdo da página original */}
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 rounded-b-lg px-3 sm:px-4 py-2 sm:py-3">
			<div className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                {user?.profileImage && !imageError ? (
                  <img 
                    src={`${getApiUrl()}${user.profileImage}`}
                    alt={`Foto de ${user?.name || 'Profissional'}`}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      // Log silencioso apenas em desenvolvimento
                      if (process.env.NODE_ENV === 'development') {
                        console.log('🖼️ Imagem não encontrada:', user.profileImage);
                      }
                      setImageError(true);
                      // Tentar carregar com URL absoluta como fallback
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('http')) {
                        img.src = `https://lifebee.onrender.com${user.profileImage}`;
                      }
                    }}
                    onLoad={() => {
                      console.log('Imagem carregada com sucesso:', user.profileImage);
                      setImageError(false);
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">Painel do Profissional</h1>
				<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Bem-vindo, {user?.name || 'Profissional'}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 min-w-0 ml-auto self-end">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs sm:text-sm font-medium ${isAvailable ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>
                    {isAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Switch 
                                                        checked={isAvailable}
                                onCheckedChange={handleAvailabilityChange}
                                className="h-6 w-11 sm:h-7 sm:w-12 [&>span]:h-5 [&>span]:w-5 sm:[&>span]:h-6 sm:[&>span]:w-6 flex-shrink-0 data-[state=checked]:bg-blue-500 data-[state=checked]:hover:bg-blue-600 data-[state=unchecked]:bg-gray-400 data-[state=unchecked]:hover:bg-gray-500 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isAvailable ? 'Clique para ficar indisponível' : 'Clique para ficar disponível'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Notifications */}
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative h-8 sm:h-9 w-8 sm:w-auto px-2.5 sm:px-3 min-w-0 flex-shrink-0 justify-center aspect-square sm:aspect-auto">
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm" align="end">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notificações</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Nenhuma notificação
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const IconComponent = notification.icon;
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${notification.color}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t">
                      <Button variant="ghost" size="sm" className="w-full">
                        Ver todas as notificações
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 sm:h-9 w-8 sm:w-auto px-2 sm:px-3 min-w-0 flex-shrink-0 gap-1 sm:gap-1.5 justify-center aspect-square sm:aspect-auto">
                    <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-[100]">
                  <DropdownMenuItem asChild>
                    <Link href="/provider-profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/provider-proposals" className="flex items-center cursor-pointer">
                      <Send className="mr-2 h-4 w-4" />
                      Propostas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        Modo Claro
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        Modo Escuro
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    Privacidade e Segurança
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    Preferências de Notificação
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Métodos de Pagamento
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Central de Ajuda
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 pb-8 sm:pb-12 lg:pb-16 space-y-6 sm:space-y-8">
          {/* Dashboard Overview - Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total de Serviços Concluídos */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Serviços</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{monthlyCompletedServices}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Este mês</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receita Total */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Receita Total</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">R$ {monthlyCompletedEarnings.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Este mês</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-full">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Média por Serviço */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Média por Serviço</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      R$ {monthlyCompletedServices > 0 ? (monthlyCompletedEarnings / monthlyCompletedServices).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Valor médio</p>
                    </div>
                  <div className="p-3 bg-purple-500 rounded-full">
                    <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* Taxa de Conclusão */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {providerAppointments.length > 0 ? Math.round((monthlyCompletedServices / providerAppointments.length) * 100) : 0}%
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Serviços finalizados</p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-full">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          

          {/* Main Content Tabs */}
          <Tabs defaultValue="opportunities" className="space-y-6 sm:space-y-8">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 h-auto min-h-12 p-1.5 gap-1.5 sm:gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="opportunities" className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 whitespace-nowrap min-h-10 sm:min-h-11 text-center font-medium transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400 data-[state=active]:shadow-md data-[state=active]:font-semibold">
                <span className="hidden xs:inline">Oportunidades</span>
                <span className="xs:hidden">Oport.</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 whitespace-nowrap min-h-10 sm:min-h-11 text-center font-medium transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400 data-[state=active]:shadow-md data-[state=active]:font-semibold">
                <span className="hidden xs:inline">Performance</span>
                <span className="xs:hidden">Perf.</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 whitespace-nowrap min-h-10 sm:min-h-11 text-center font-medium transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400 data-[state=active]:shadow-md data-[state=active]:font-semibold">
                <span className="hidden xs:inline">Histórico</span>
                <span className="xs:hidden">Hist.</span>
              </TabsTrigger>
            </TabsList>

            {/* Service Opportunities Tab */}
            <TabsContent value="opportunities" className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-base sm:text-lg lg:text-xl">Serviços Próximos a Você</span>
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-600">Raio:</span>
                        <Input
                          type="number"
                          value={searchRadius}
                          onChange={(e) => setSearchRadius(Number(e.target.value))}
                          className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm"
                          min="1"
                          max="50"
                        />
                        <span className="text-xs sm:text-sm text-gray-600">km</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Map Placeholder */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-48 sm:h-56 md:h-64 mb-4 sm:mb-6 overflow-hidden relative sticky top-2 sm:top-4 z-10">
                    {/* Botão de localização */}
                    <div className="absolute top-2 right-2 z-20">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('🔘 Botão de localização clicado!');
                          if (locationRequested && userLocation) {
                            // Se já tem localização, centraliza o mapa
                            centerMapOnUser();
                          } else {
                            // Se não tem localização, obtém a localização
                            getUserLocation();
                          }
                        }}
                        className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
                        disabled={locationLoading}
                      >
                        {locationLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        ) : !locationRequested ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-xs hidden sm:inline">Minha Localização</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-xs hidden sm:inline">Centralizar</span>
                          </div>
                        )}
                      </Button>
                    </div>
                    
                    {locationLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                          <p className="text-gray-600 dark:text-gray-400">Obtendo sua localização...</p>
                        </div>
                      </div>
                    ) : !userLocation ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="text-center">
                          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 dark:text-gray-400 mb-3">Clique para obter sua localização</p>
                          <Button 
                            size="sm" 
                            onClick={getUserLocation}
                            disabled={locationLoading}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          >
                            {locationLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 mr-1" />
                                Obter Localização
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <MapContainer 
                        center={userLocation || [-23.55052, -46.633308]} 
                        zoom={15} 
                        style={{ height: '100%', width: '100%' }}
                        key={`map-${mapKey}-${userLocation ? `${userLocation[0]}-${userLocation[1]}` : 'fallback'}`}
                      >
                        {userLocation && <MapController userLocation={userLocation} />}
                        <LayersControl position="topright">
                          <LayersControl.BaseLayer checked={theme !== 'dark'} name="OSM Claro">
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                          </LayersControl.BaseLayer>
                          <LayersControl.BaseLayer checked={theme === 'dark'} name="Carto Escuro">
                            <TileLayer
                              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                          </LayersControl.BaseLayer>
                        </LayersControl>
                        {/* Marcador da localização atual do usuário */}
                        {userLocation && (
                          <Marker 
                            position={userLocation}
                            icon={L.divIcon({
                              className: 'custom-div-icon',
                              html: `<div style="position: relative; width: 28px; height: 34px;">
                                <div style=\"position:absolute; left:50%; top:50%; transform: translate(-50%, -55%); background-color: ${locationUpdated ? '#10b981' : '#3b82f6'}; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); animation: pulse 2s infinite; ${locationUpdated ? 'border-color: #10b981;' : ''}\"></div>
                                <div style=\"position:absolute; left:50%; bottom:0; transform: translate(-50%, 50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #fff; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));\"></div>
                              </div>`,
                              iconSize: [28, 34],
                              iconAnchor: [14, 30]
                            })}
                          />
                        )}
                        
                        {/* Marcadores das solicitações de serviço */}
                        {nearbyServices.map((service) => {
                          const serviceCoords = serviceLocations[service.id];
                          if (!serviceCoords) return null;
                          
                          const isEditing = editingLocation === service.id;
                          const isSelected = selectedMapService?.id === service.id;
                          
                                                      return (
                              <Marker 
                                key={service.id} 
                                position={serviceCoords}
                                draggable={isEditing}
                                icon={L.divIcon({
                                  className: 'custom-div-icon',
                                  html: `<div style="position: relative; width: 34px; height: 34px;">
                                    <div style=\"position:absolute; left:50%; top:50%; transform: translate(-50%, -50%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); background-image: url('/service-icon.png'); background-size: cover; background-position: center; background-repeat: no-repeat; ${isSelected ? 'animation: pulse 2s infinite;' : ''}\"></div>
                                    <div style=\"position:absolute; left:50%; bottom:0; transform: translate(-50%, 50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #fff; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));\"></div>
                                  </div>`,
                                  iconSize: [34, 40],
                                  iconAnchor: [17, 34]
                                })}
                              eventHandlers={{
                                click: () => {
                                  if (isEditing) {
                                    // Finalizar edição
                                    setEditingLocation(null);
                                  } else {
                                    // Abrir modal com detalhes do serviço
                                    handleMapServiceClick(service);
                                  }
                                },
                                dragend: (e) => {
                                  if (isEditing) {
                                    const newPos = e.target.getLatLng();
                                    setServiceLocations(prev => ({
                                      ...prev,
                                      [service.id]: [newPos.lat, newPos.lng]
                                    }));
                                    setEditingLocation(null);
                                    toast({
                                      title: "Posição Atualizada",
                                      description: "A posição da solicitação foi ajustada manualmente.",
                                    });
                                  }
                                }
                              }}
                            >
                              {/* Popup removido - detalhes aparecem no modal */}
                            </Marker>
                          );
                        })}
                      </MapContainer>
                    )}
                    <div className="absolute left-0 right-0 bottom-0 p-2 text-center pointer-events-none">
                      <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                          Mostrando serviços em um raio de {searchRadius}km
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Sua localização</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Solicitações ({nearbyServices.length})</span>
                          </div>
                          {selectedMapService && (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                              <span>Selecionado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Requests */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg">Solicitações Disponíveis</h3>
                        {geocodingErrors.length > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ {geocodingErrors.length} endereço(s) não localizados
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchServiceRequests}
                        disabled={loadingServices}
                        className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                      >
                        {loadingServices ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary mr-1 sm:mr-2"></div>
                            <span className="hidden sm:inline">Carregando...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Atualizar</span>
                            <span className="sm:hidden">Atualizar</span>
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {loadingServices ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="relative mx-auto mb-3 sm:mb-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-200 rounded-full"></div>
                          <div 
                            className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary rounded-full"
                            style={{
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + (loadingProgress * 0.36)}% 0%, ${50 + (loadingProgress * 0.36)}% 50%)`
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs sm:text-sm font-medium text-primary">{loadingProgress}%</span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{loadingMessage}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 max-w-xs mx-auto">
                          <div 
                            className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : nearbyServices.length === 0 ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">Nenhuma solicitação disponível</p>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">Novas solicitações aparecerão aqui automaticamente</p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            💡 <strong>Dica:</strong> Clique nos pins amarelos no mapa para ver detalhes dos serviços!
                          </p>
                        </div>
                      </div>
                    ) : (
                      nearbyServices.map((service) => (
                      <Card key={service.id} id={`service-${service.id}`} className="border-l-4 border-l-primary transition-all duration-300">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h4 className="font-semibold text-sm sm:text-base lg:text-lg">Solicitação #{service.id}</h4>
                                <Badge variant="outline" className="text-xs w-fit">
                                  {service.category === 'fisioterapeuta' ? 'Fisioterapeuta' :
                                   service.category === 'acompanhante_hospitalar' ? 'Acompanhante' :
                                   service.category === 'tecnico_enfermagem' ? 'Técnico Enfermagem' : service.category}
                                </Badge>
                              </div>
                              <p className="font-medium text-primary mb-1 text-sm sm:text-base">{service.serviceType}</p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{service.description}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                                <span className="flex items-center gap-1 min-w-0">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{(service as any).address || (service as any).location || 'Não informado'}</span>
                                </span>
                                <span className="flex items-center gap-1 min-w-0">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{new Date(service.scheduledDate).toLocaleDateString('pt-BR')} às {service.scheduledTime}</span>
                                </span>
                                <span className="flex items-center gap-1 min-w-0">
                                  <MessageCircle className="h-3 w-3 flex-shrink-0" />
                                  <span>{service.responses || 0} respostas</span>
                                </span>
                                {serviceLocations[service.id] && userLocation && (
                                  <span className="flex items-center gap-1 min-w-0">
                                    <span className="h-3 w-3 flex-shrink-0">📏</span>
                                    <span>{calculateDistance(
                                      userLocation[0], 
                                      userLocation[1], 
                                      serviceLocations[service.id][0], 
                                      serviceLocations[service.id][1]
                                    ).toFixed(1)} km</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                              {service.budget && (
                                <p className="text-sm sm:text-base lg:text-lg font-bold text-green-600">R$ {parseFloat(service.budget).toFixed(2)}</p>
                              )}
                              <Button 
                                size="sm" 
                                className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                                onClick={() => handleOfferService(service.id)}
                              >
                                Ofertar Serviço
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-8">
              {/* Header com botão de atualização */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance e Estatísticas</h2>
                <Button 
                  onClick={fetchPerformanceStats}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar Dados
                </Button>
              </div>
              
              {/* Mensagem informativa */}
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Info className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Dados de Performance
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      Os dados de performance e estatísticas estão sendo exibidos na área principal do dashboard acima.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Metas e progresso do mês */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Metas do Mês
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Seletor de modo de meta */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => setMonthlyGoalMode('services')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${monthlyGoalMode === 'services' ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>Meta por Serviços</button>
                        <button onClick={() => setMonthlyGoalMode('revenue')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${monthlyGoalMode === 'revenue' ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>Meta por Receita</button>
                        <button onClick={handleGenerateMonthlyReport} className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800">
                          <FileText className="h-4 w-4" />
                          Gerar Relatório (PDF)
                        </button>
                        <div className="flex items-center gap-2 ml-auto w-full sm:w-auto sm:flex-nowrap flex-wrap">
                          <input
                            type="date"
                            value={periodStart}
                            onChange={(e) => setPeriodStart(e.target.value)}
                            className="px-3 py-1.5 rounded-md border bg-white dark:bg-gray-900 text-sm w-[140px]"
                          />
                          <span className="text-sm text-gray-500">a</span>
                          <input
                            type="date"
                            value={periodEnd}
                            onChange={(e) => setPeriodEnd(e.target.value)}
                            className="px-3 py-1.5 rounded-md border bg-white dark:bg-gray-900 text-sm w-[140px]"
                          />
                        </div>
                      </div>

                      {/* Inputs de meta */}
                      {monthlyGoalMode === 'services' ? (
                        <div className="space-y-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">Defina sua meta de serviços no mês</label>
                          <div className="flex gap-2">
                            <input type="number" min={1} value={monthlyGoalServices} onChange={(e) => setMonthlyGoalServices(Math.max(1, parseInt(e.target.value || '0')))} className="w-28 px-3 py-2 rounded-md border bg-white dark:bg-gray-900" />
                            <span className="self-center text-sm text-gray-500">serviços</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">Defina sua meta de receita no mês</label>
                          <div className="flex gap-2">
                            <span className="self-center text-sm text-gray-500">R$</span>
                            <input type="number" min={100} step={50} value={monthlyGoalRevenue} onChange={(e) => setMonthlyGoalRevenue(Math.max(100, parseFloat(e.target.value || '0')))} className="w-32 px-3 py-2 rounded-md border bg-white dark:bg-gray-900" />
                          </div>
                        </div>
                      )}

                      {/* Barras de progresso bonitas */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Serviços concluídos</span>
                            <span className="text-sm text-gray-600">{monthlyCompletedServices}/{monthlyGoalServices} ({Math.min(100, Math.round((monthlyCompletedServices / (monthlyGoalServices || 1)) * 100))}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all" style={{ width: `${Math.min(100, (monthlyCompletedServices / (monthlyGoalServices || 1)) * 100)}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Receita do mês</span>
                            <span className="text-sm text-gray-600">R$ {monthlyCompletedEarnings.toLocaleString('pt-BR')} / R$ {monthlyGoalRevenue.toLocaleString('pt-BR')} ({Math.min(100, Math.round((monthlyCompletedEarnings / (monthlyGoalRevenue || 1)) * 100))}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (monthlyCompletedEarnings / (monthlyGoalRevenue || 1)) * 100)}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Dicas rápidas */}
                      <div className="text-xs text-gray-500">Dica: aumente sua disponibilidade e responda rápido para bater a meta!</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico de Performance Semanal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Semanal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-4">
                      {/* Gráfico de barras simples para serviços da semana */}
                      <div className="space-y-3">
                        {(() => {
                          const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                            const now = new Date();
                          const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
                          
                          // Debug: verificar dados
                          console.log('🔍 Debug Gráfico Semanal:', {
                            totalCompletedServices: completedServices.length,
                            completedServices: completedServices.slice(0, 3),
                            weekStart: weekStart.toISOString(),
                            weeklyData: weekDays.map((day, index) => {
                              const dayStart = new Date(weekStart.getTime() + (index * 24 * 60 * 60 * 1000));
                              const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000));
                              const servicesCount = completedServices.filter((service: any) => {
                                const completionDate = service.completionDate ? new Date(service.completionDate) : 
                                                     service.createdAt ? new Date(service.createdAt) : null;
                                return completionDate && completionDate >= dayStart && completionDate < dayEnd;
                              }).length;
                              return { day, count: servicesCount, dayStart: dayStart.toISOString(), dayEnd: dayEnd.toISOString() };
                            })
                          });
                          
                          const weeklyData = weekDays.map((day, index) => {
                            const dayStart = new Date(weekStart.getTime() + (index * 24 * 60 * 60 * 1000));
                            const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000));
                            
                            // Usar dados reais dos serviços concluídos
                            const servicesCount = completedServices.filter((service: any) => {
                              const completionDate = service.completedAt ? new Date(service.completedAt) : null;
                              
                              // Debug para cada serviço
                              if (completedServices.length > 0) {
                                console.log('🔍 Filtro diário:', {
                                  serviceId: service.serviceRequestId,
                                  completedAt: service.completedAt,
                                  parsedDate: completionDate?.toISOString(),
                                  dayStart: dayStart.toISOString(),
                                  dayEnd: dayEnd.toISOString(),
                                  isInRange: completionDate && completionDate >= dayStart && completionDate < dayEnd
                                });
                              }
                              
                              return completionDate && completionDate >= dayStart && completionDate < dayEnd;
                            }).length;
                            
                            // Calcular altura da barra de forma fixa e confiável
                            let height = 0;
                            if (servicesCount > 0) {
                              if (servicesCount === 1) height = 25;
                              else if (servicesCount === 2) height = 50;
                              else if (servicesCount === 3) height = 75;
                              else height = 100;
                            }
                            
                            return { day, count: servicesCount, height };
                          });
                          
                            return (
                            <div className="flex items-end justify-between h-32">
                              {weeklyData.map((data, index) => (
                                <div key={index} className="flex flex-col items-center">
                                  <div className="text-xs text-gray-500 mb-1">{data.count}</div>
                                  <div 
                                    className="w-8 bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t-sm transition-all duration-300"
                                    style={{ height: `${data.height}%` }}
                                  ></div>
                                  <div className="text-xs text-gray-500 mt-1">{data.day}</div>
                                </div>
                              ))}
                              </div>
                            );
                        })()}
                      </div>
                      
                      <div className="text-center text-sm text-gray-600">
                        Serviços concluídos por dia da semana
                                </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

              


            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-8">
              <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Histórico de Serviços Concluídos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <ProfessionalDashboard professionalId={user?.id || 0} />
                  </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Bottom Navigation for Provider */}
      </div>

      {/* Modal de Detalhes do Serviço */}
      <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-6 w-6 text-yellow-500" />
              Detalhes da Solicitação
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre o cliente e o serviço solicitado
            </DialogDescription>
          </DialogHeader>
          
          {selectedMapService && (
            <div className="space-y-6">
              {/* Card Principal com Informações do Cliente */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar do Cliente */}
                      {selectedMapService.clientProfileImage ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden">
                          <img
                            src={`${getApiUrl()}${selectedMapService.clientProfileImage}`}
                            alt={selectedMapService.clientName || 'Cliente'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Log silencioso apenas em desenvolvimento
                              if (process.env.NODE_ENV === 'development') {
                                console.log('🖼️ Imagem do cliente não encontrada:', selectedMapService.clientProfileImage);
                              }
                              // Fallback para inicial se a imagem falhar
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                    <span class="text-white text-xl font-bold">
                                      ${selectedMapService.clientName ? selectedMapService.clientName.charAt(0).toUpperCase() : 'C'}
                                    </span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {selectedMapService.clientName ? selectedMapService.clientName.charAt(0).toUpperCase() : 'C'}
                          </span>
                        </div>
                      )}
                      
                      {/* Informações do Cliente */}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedMapService.clientName || 'Cliente'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {selectedMapService.clientRating || '5.0'}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {selectedMapService.clientServices || '0'} serviços
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Cliente desde {selectedMapService.clientSince ? new Date(selectedMapService.clientSince).getFullYear() : '2024'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status da Solicitação */}
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {selectedMapService.status === 'open' ? 'Aberta' : 
                       selectedMapService.status === 'in_progress' ? 'Em Andamento' : 
                       selectedMapService.status === 'completed' ? 'Concluída' : 'Normal'}
                    </div>
                  </div>
                </div>
                
                {/* Detalhes do Serviço */}
                <div className="p-6 pt-0 space-y-4">
                  {/* Tipo de Serviço */}
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">
                      {selectedMapService.serviceType || 'Serviço Solicitado'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedMapService.description || 'Descrição do serviço não disponível'}
                    </p>
                  </div>
                  
                  {/* Grid de Informações */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {/* Orçamento */}
                    <div className="text-center">
                      <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Orçamento</p>
                      <p className="font-semibold text-green-600">
                        R$ {selectedMapService.budget ? parseFloat(selectedMapService.budget).toFixed(2) : '0,00'}
                      </p>
                    </div>
                    
                    {/* Distância */}
                    <div className="text-center">
                      <MapPin className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Distância</p>
                      <p className="font-semibold text-blue-600">
                        {serviceLocations[selectedMapService.id] && userLocation ? 
                          `${calculateDistance(
                            userLocation[0], 
                            userLocation[1], 
                            serviceLocations[selectedMapService.id][0], 
                            serviceLocations[selectedMapService.id][1]
                          ).toFixed(1)} km` : '0 km'}
                      </p>
                    </div>
                    
                    {/* Horário */}
                    <div className="text-center">
                      <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Horário</p>
                      <p className="font-semibold text-purple-600">
                        {selectedMapService.scheduledTime || 'Não definido'}
                      </p>
                    </div>
                    
                    {/* Respostas */}
                    <div className="text-center">
                      <MessageCircle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Respostas</p>
                      <p className="font-semibold text-orange-600">
                        {selectedMapService.responses || 0}
                      </p>
                    </div>
                  </div>
                  
                  {/* Informações Detalhadas */}
                  <div className="space-y-3">
                    {/* Endereço */}
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Endereço
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {selectedMapService.address || 'Endereço não informado'}
                      </p>
                    </div>
                    
                    {/* Data */}
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        Data
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {selectedMapService.scheduledDate ? 
                          new Date(selectedMapService.scheduledDate).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Data não definida'}
                      </p>
                    </div>
                    
                    {/* Detalhes Adicionais */}
                    {selectedMapService.additionalInfo && (
                      <div>
                        <h4 className="font-semibold mb-1 text-gray-900 dark:text-white flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          Detalhes Adicionais
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          {selectedMapService.additionalInfo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => handleOfferService(selectedMapService.id)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Fazer Proposta
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCloseServiceModal}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
              
              {/* Botão para limpar seleção */}
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="w-full text-xs"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Limpar Seleção no Mapa
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProviderLayout>
  );
}
 