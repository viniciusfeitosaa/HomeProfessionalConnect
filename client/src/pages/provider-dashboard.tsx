import { useState, useEffect } from "react";
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
  X, CheckCircle, AlertCircle, Info, Heart, RefreshCw
} from "lucide-react";
import { LifeBeeLogo } from "@/components/lifebee-logo";
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
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { ProviderLayout } from "@/components/ProviderLayout";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getApiUrl } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";

export default function ProviderDashboard() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([-23.55052, -46.633308]); // São Paulo como fallback
  const [locationLoading, setLocationLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const { toast } = useToast();

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

  const handleLogout = () => {
    logout();
    window.location.href = '/';
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

  // Mapeamento local de endereços conhecidos de São Paulo
  const saoPauloAddresses: {[key: string]: [number, number]} = {
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
  };

  // Cache para coordenadas já processadas
  const coordinatesCache = new Map<string, [number, number]>();

  const getAddressCoordinates = async (address: string): Promise<[number, number] | null> => {
    try {
      // Verificar cache primeiro
      if (coordinatesCache.has(address)) {
        const cachedCoords = coordinatesCache.get(address)!;
        console.log(`✅ Coordenadas encontradas no cache: "${address}" → [${cachedCoords[0]}, ${cachedCoords[1]}]`);
        return cachedCoords;
      }

      // Limpar e formatar o endereço
      const cleanAddress = address.toLowerCase().trim().replace(/\s+/g, ' ');
      
      // 1. Busca exata no mapeamento local
      for (const [key, coords] of Object.entries(saoPauloAddresses)) {
        if (cleanAddress === key) {
          coordinatesCache.set(address, coords);
          console.log(`✅ Busca exata no mapeamento local: "${address}" → [${coords[0]}, ${coords[1]}]`);
          return coords;
        }
      }
      
      // 2. Busca parcial no mapeamento local (mais inteligente)
      let bestMatch: { key: string; coords: [number, number]; score: number } | null = null;
      
      for (const [key, coords] of Object.entries(saoPauloAddresses)) {
        const score = calculateAddressSimilarity(cleanAddress, key);
        if (score > 0.7 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { key, coords, score };
        }
      }
      
      if (bestMatch) {
        coordinatesCache.set(address, bestMatch.coords);
        console.log(`✅ Busca parcial no mapeamento local: "${address}" → "${bestMatch.key}" (score: ${bestMatch.score.toFixed(2)}) → [${bestMatch.coords[0]}, ${bestMatch.coords[1]}]`);
        return bestMatch.coords;
      }
      
      // 3. Geocoding externo com múltiplas tentativas e melhor precisão
      const searchQueries = [
        cleanAddress + ', são paulo, sp, brasil',
        cleanAddress + ', são paulo, brasil',
        cleanAddress + ', sp, brasil',
        cleanAddress + ', brasil',
        cleanAddress
      ];
      
      for (const query of searchQueries) {
        try {
          console.log(`🌐 Tentando geocoding externo para: "${query}"`);
          
          // Usar AbortController para timeout mais agressivo
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3&countrycodes=br&addressdetails=1&accept-language=pt-BR&bounded=1&viewbox=-47.2,-24.0,-46.0,-23.0`,
            { signal: controller.signal }
          );
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              // Escolher o melhor resultado baseado na relevância
              const bestResult = data.reduce((best: any, current: any) => {
                const currentScore = parseFloat(current.importance || 0);
                const bestScore = parseFloat(best.importance || 0);
                return currentScore > bestScore ? current : best;
              });
              
              const lat = parseFloat(bestResult.lat);
              const lon = parseFloat(bestResult.lon);
              
              // Verificação mais rigorosa das coordenadas de São Paulo
              if (isValidSaoPauloCoordinates(lat, lon)) {
                const coords: [number, number] = [lat, lon];
                coordinatesCache.set(address, coords);
                console.log(`✅ Geocoding externo bem-sucedido para "${address}": [${lat}, ${lon}] (relevância: ${bestResult.importance})`);
                return coords;
              } else {
                console.log(`⚠️ Coordenadas fora de São Paulo para "${address}": [${lat}, ${lon}]`);
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
      
      // 4. Fallback inteligente baseado no bairro/cidade
      const fallbackCoords = getIntelligentFallback(cleanAddress);
      coordinatesCache.set(address, fallbackCoords);
      console.log(`🔄 Usando fallback inteligente para "${address}": [${fallbackCoords[0].toFixed(6)}, ${fallbackCoords[1].toFixed(6)}]`);
      return fallbackCoords;
      
    } catch (error) {
      console.error('Erro geral no geocoding:', error);
      
      // Fallback final: centro de São Paulo
      const fallbackCoords: [number, number] = [-23.5505, -46.6333];
      coordinatesCache.set(address, fallbackCoords);
      console.log(`🔄 Fallback final para "${address}": centro de São Paulo`);
      return fallbackCoords;
    }
  };

  // Função para calcular similaridade entre endereços
  const calculateAddressSimilarity = (addr1: string, addr2: string): number => {
    const words1 = addr1.split(' ').filter(w => w.length > 2);
    const words2 = addr2.split(' ').filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => 
      words2.some(w2 => w2.includes(word) || word.includes(w2))
    );
    
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  // Função para validar coordenadas de São Paulo
  const isValidSaoPauloCoordinates = (lat: number, lon: number): boolean => {
    // Limites mais precisos de São Paulo
    return lat >= -24.0 && lat <= -23.3 && lon >= -47.2 && lon <= -46.0;
  };

  // Função para fallback inteligente baseado no endereço
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
      const categories = ['fisioterapeuta', 'acompanhante_hospitalar', 'tecnico_enfermagem'];
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
          if (request.address) {
            try {
              const coords = await getAddressCoordinates(request.address);
              if (coords) {
                locations[request.id] = coords;
                console.log(`✅ Endereço geocodificado: ${request.address} → [${coords[0]}, ${coords[1]}]`);
              } else {
                geocodingErrors.push(request.address);
                console.warn(`❌ Falha no geocoding: ${request.address}`);
              }
            } catch (error) {
              geocodingErrors.push(request.address);
              console.error(`❌ Erro no geocoding para ${request.address}:`, error);
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

  // Obter localização atual do usuário
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setLocationLoading(false);
        },
        (error) => {
          // Log mais discreto para erros comuns de geolocalização
          if (error.code === 2) {
            console.log("📍 Localização em rede indisponível, usando localização padrão");
          } else {
            console.log("📍 Usando localização padrão de São Paulo");
          }
          setLocationLoading(false);
          // Mantém São Paulo como fallback
        },
        {
          enableHighAccuracy: false, // Menos agressivo
          timeout: 5000, // Timeout menor
          maximumAge: 600000 // 10 minutos
        }
      );
    } else {
      setLocationLoading(false);
      console.log("Geolocalização não suportada pelo navegador");
    }
  }, []);

  // Carregar solicitações de serviço quando o usuário estiver autenticado
  useEffect(() => {
    console.log('useEffect triggered - user:', user);
    if (user) {
      console.log('User authenticated, calling fetchServiceRequests');
      fetchServiceRequests();
    } else {
      console.log('User not authenticated yet');
    }
  }, [user]);

  return (
    <ProviderLayout>
      {/* Conteúdo da página original */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LifeBeeLogo size={32} />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Painel do Profissional</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bem-vindo de volta, {user?.name || 'Profissional'}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Disponível</span>
                <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
              </div>
              
              {/* Notifications */}
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
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
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
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

        <div className="p-4 lg:p-6 space-y-6">
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ganhos do Mês</p>
                    <p className="text-2xl font-bold text-green-600">R$ {analytics.monthlyEarnings.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+{analytics.monthlyGrowth}% vs mês anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Serviços Realizados</p>
                    <p className="text-2xl font-bold">{analytics.totalServices}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{analytics.servicesThisWeek} esta semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avaliação Média</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      {analytics.averageRating}
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </p>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Baseado em 47 avaliações</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tempo de Resposta</p>
                    <p className="text-2xl font-bold">{analytics.responseTime}</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Média de resposta</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="opportunities" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <Link href="/agenda-profissional">
                <button type="button" className="shadcn-tabs-trigger">Agenda</button>
              </Link>
              <TabsTrigger value="earnings">Ganhos</TabsTrigger>
            </TabsList>

            {/* Service Opportunities Tab */}
            <TabsContent value="opportunities" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Serviços Próximos a Você
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Raio:</span>
                        <Input
                          type="number"
                          value={searchRadius}
                          onChange={(e) => setSearchRadius(Number(e.target.value))}
                          className="w-16 h-8"
                          min="1"
                          max="50"
                        />
                        <span className="text-sm text-gray-600">km</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Map Placeholder */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 mb-6 overflow-hidden relative sticky top-4 z-10">
                    {locationLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                          <p className="text-gray-600 dark:text-gray-400">Obtendo sua localização...</p>
                        </div>
                      </div>
                    ) : (
                      <MapContainer 
                        center={userLocation} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%' }}
                        key={`${userLocation[0]}-${userLocation[1]}`} // Força re-render quando localização muda
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* Marcador da localização atual do usuário */}
                        <Marker 
                          position={userLocation}
                          icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                          })}
                        >
                          <Popup>
                            <div className="text-center">
                              <strong>📍 Sua localização</strong><br />
                              <small>Raio de busca: {searchRadius}km</small>
                            </div>
                          </Popup>
                        </Marker>
                        
                        {/* Marcadores das solicitações de serviço */}
                        {nearbyServices.map((service) => {
                          const serviceCoords = serviceLocations[service.id];
                          if (!serviceCoords) return null;
                          
                          const isEditing = editingLocation === service.id;
                          
                          return (
                            <Marker 
                              key={service.id} 
                              position={serviceCoords}
                              draggable={isEditing}
                              eventHandlers={{
                                click: () => {
                                  if (isEditing) {
                                    // Finalizar edição
                                    setEditingLocation(null);
                                  } else {
                                    // Scroll para o card da solicitação
                                    const element = document.getElementById(`service-${service.id}`);
                                    if (element) {
                                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      element.classList.add('ring-2', 'ring-yellow-500');
                                      setTimeout(() => {
                                        element.classList.remove('ring-2', 'ring-yellow-500');
                                      }, 2000);
                                    }
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
                              <Popup>
                                <div className="min-w-[200px]">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${isEditing ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                                    <strong>Solicitação #{service.id}</strong>
                                    {isEditing && <span className="text-xs text-red-600 font-medium">(Arraste para ajustar)</span>}
                                  </div>
                                  <p className="font-medium text-sm mb-1">{service.serviceType}</p>
                                  <p className="text-xs text-gray-600 mb-2">{service.description.substring(0, 50)}...</p>
                                  <div className="text-xs text-gray-500">
                                    <p className="font-medium text-blue-600">📍 {service.address}</p>
                                    <p>📅 {new Date(service.scheduledDate).toLocaleDateString('pt-BR')} às {service.scheduledTime}</p>
                                    {service.budget && (
                                      <p className="font-semibold text-green-600">R$ {parseFloat(service.budget).toFixed(2)}</p>
                                    )}
                                    {serviceLocations[service.id] && (
                                      <div className="text-xs text-gray-400 mt-1 space-y-1">
                                        <p>📍 Coordenadas: {serviceLocations[service.id][0].toFixed(6)}, {serviceLocations[service.id][1].toFixed(6)}</p>
                                        <p>📏 Distância: {calculateDistance(
                                          userLocation[0], 
                                          userLocation[1], 
                                          serviceLocations[service.id][0], 
                                          serviceLocations[service.id][1]
                                        ).toFixed(1)} km</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <Button 
                                      size="sm" 
                                      className="flex-1"
                                      onClick={() => handleOfferService(service.id)}
                                    >
                                      Ofertar Serviço
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setEditingLocation(service.id)}
                                      title="Ajustar posição no mapa"
                                    >
                                      📍
                                    </Button>
                                  </div>
                                </div>
                              </Popup>
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
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Requests */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Solicitações Disponíveis</h3>
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
                      >
                        {loadingServices ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            Carregando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Atualizar
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {loadingServices ? (
                      <div className="text-center py-8">
                        <div className="relative mx-auto mb-4">
                          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                          <div 
                            className="absolute top-0 left-0 w-16 h-16 border-4 border-primary rounded-full"
                            style={{
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + (loadingProgress * 0.36)}% 0%, ${50 + (loadingProgress * 0.36)}% 50%)`
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{loadingProgress}%</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{loadingMessage}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : nearbyServices.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Bell className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhuma solicitação disponível</p>
                        <p className="text-sm text-gray-500">Novas solicitações aparecerão aqui automaticamente</p>
                      </div>
                    ) : (
                      nearbyServices.map((service) => (
                      <Card key={service.id} id={`service-${service.id}`} className="border-l-4 border-l-primary transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">Solicitação #{service.id}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {service.category === 'fisioterapeuta' ? 'Fisioterapeuta' :
                                   service.category === 'acompanhante_hospitalar' ? 'Acompanhante' :
                                   service.category === 'tecnico_enfermagem' ? 'Técnico Enfermagem' : service.category}
                                </Badge>
                              </div>
                              <p className="font-medium text-primary mb-1">{service.serviceType}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{service.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {service.address}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(service.scheduledDate).toLocaleDateString('pt-BR')} às {service.scheduledTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {service.responses || 0} respostas
                                </span>
                                {serviceLocations[service.id] && (
                                  <span className="flex items-center gap-1">
                                    <span className="h-3 w-3">📏</span>
                                    {calculateDistance(
                                      userLocation[0], 
                                      userLocation[1], 
                                      serviceLocations[service.id][0], 
                                      serviceLocations[service.id][1]
                                    ).toFixed(1)} km
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              {service.budget && (
                                <p className="text-lg font-bold text-green-600">R$ {parseFloat(service.budget).toFixed(2)}</p>
                              )}
                              <Button 
                                size="sm" 
                                className="mt-2"
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
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyData.map((data, index) => (
                        <div key={data.month} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{data.month}</p>
                            <p className="text-sm text-gray-600">{data.services} serviços</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">R$ {data.earnings.toLocaleString('pt-BR')}</p>
                            {index > 0 && (
                              <p className="text-xs text-gray-500">
                                {data.earnings > monthlyData[index-1].earnings ? '+' : ''}
                                {((data.earnings - monthlyData[index-1].earnings) / monthlyData[index-1].earnings * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Metas e Objetivos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Meta Mensal: R$ 5.000</span>
                          <span className="text-sm text-gray-600">97%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '97%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Serviços no Mês: 25</span>
                          <span className="text-sm text-gray-600">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Avaliação 4.8+</span>
                          <span className="text-sm text-gray-600">100%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximos Agendamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border border-orange-200 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Maria Silva</h4>
                        <p className="text-sm text-gray-600">Fisioterapia Respiratória</p>
                        <p className="text-sm text-orange-600 font-medium">Hoje às 14:00 • Vila Madalena</p>
                      </div>
                      <Button size="sm">Ver Detalhes</Button>
                    </div>

                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">João Santos</h4>
                        <p className="text-sm text-gray-600">Acompanhamento Hospitalar</p>
                        <p className="text-sm text-gray-500">Amanhã às 08:00 • Hospital das Clínicas</p>
                      </div>
                      <Button variant="outline" size="sm">Ver Detalhes</Button>
                    </div>

                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="bg-green-100 dark:bg-green-900 text-green-600 rounded-full w-10 h-10 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Ana Costa</h4>
                        <p className="text-sm text-gray-600">Curativo Domiciliar</p>
                        <p className="text-sm text-gray-500">Quinta-feira às 16:00 • Jardins</p>
                      </div>
                      <Button variant="outline" size="sm">Ver Detalhes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Histórico de Ganhos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="font-medium">Fisioterapia Respiratória</p>
                          <p className="text-sm text-gray-600">Maria Silva • Hoje</p>
                        </div>
                        <p className="font-semibold text-green-600">+R$ 120,00</p>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="font-medium">Acompanhamento Hospitalar</p>
                          <p className="text-sm text-gray-600">João Santos • Ontem</p>
                        </div>
                        <p className="font-semibold text-green-600">+R$ 200,00</p>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="font-medium">Curativo Domiciliar</p>
                          <p className="text-sm text-gray-600">Ana Costa • 2 dias atrás</p>
                        </div>
                        <p className="font-semibold text-green-600">+R$ 80,00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Resumo do Mês
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">R$ 4.850</p>
                        <p className="text-sm text-gray-600">Total em Maio</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Fisioterapia</span>
                          <span className="text-sm font-medium">R$ 2.400</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Acompanhamento</span>
                          <span className="text-sm font-medium">R$ 1.600</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Curativos</span>
                          <span className="text-sm font-medium">R$ 850</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Bottom Navigation for Provider */}
      </div>
    </ProviderLayout>
  );
}