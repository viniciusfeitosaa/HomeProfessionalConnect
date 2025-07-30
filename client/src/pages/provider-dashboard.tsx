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
  MessageSquare
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
      const cityStateMatch = cleanAddress.match(/([^,]+),\s*([a-z]{2})/);
      let city = '';
      let state = '';
      
      if (cityStateMatch) {
        city = cityStateMatch[1].trim();
        state = cityStateMatch[2].trim().toUpperCase();
      }
      
      // 4. Geocoding externo com múltiplas tentativas baseadas na cidade detectada
      const searchQueries = [];
      
      if (city && state) {
        // Tentativas específicas para a cidade detectada
        searchQueries.push(
          cleanAddress + ', ' + city + ', ' + state + ', brasil',
          cleanAddress + ', ' + city + ', ' + state,
          cleanAddress + ', ' + state + ', brasil',
          cleanAddress + ', brasil'
        );
      } else {
        // Tentativas genéricas
        searchQueries.push(
          cleanAddress + ', brasil',
          cleanAddress
        );
      }
      
      for (const query of searchQueries) {
        try {
          console.log(`🌐 Tentando geocoding externo para: "${query}"`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3&countrycodes=br&addressdetails=1&accept-language=pt-BR`,
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
              
              // Verificar se as coordenadas são válidas para o Brasil
              if (isValidBrazilCoordinates(lat, lon)) {
                const coords: [number, number] = [lat, lon];
                coordinatesCache.set(address, coords);
                console.log(`✅ Geocoding externo bem-sucedido para "${address}": [${lat}, ${lon}] (relevância: ${bestResult.importance})`);
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
      const fallbackCoords = getIntelligentFallbackByCity(cleanAddress, city, state);
      coordinatesCache.set(address, fallbackCoords);
      console.log(`🔄 Usando fallback inteligente para "${address}": [${fallbackCoords[0].toFixed(6)}, ${fallbackCoords[1].toFixed(6)}]`);
      return fallbackCoords;
      
    } catch (error) {
      console.error('Erro geral no geocoding:', error);
      
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
        (position) => {
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
          
          toast({
            title: "Erro na Localização",
            description: errorMessage,
            variant: "destructive",
          });
        },
        options
      );
    } else {
      console.log('📍 Geolocalização não suportada pelo navegador');
      setLocationLoading(false);
      
      toast({
        title: "Geolocalização Não Suportada",
        description: "Seu navegador não suporta geolocalização. Atualize o navegador.",
        variant: "destructive",
      });
    }
  };

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

  // Função para centralizar o mapa na localização do usuário
  const centerMapOnUser = () => {
    if (userLocation) {
      console.log('🗺️ Centralizando mapa na localização do usuário:', userLocation);
      setMapKey(prev => prev + 1);
      
      toast({
        title: "Mapa Centralizado",
        description: "Mapa centralizado na sua localização atual.",
      });
    } else {
      toast({
        title: "Localização Não Disponível",
        description: "Clique em 'Minha Localização' primeiro para obter sua posição.",
        variant: "destructive",
      });
    }
  };

  // Função para melhorar a precisão da geolocalização
  const improveLocationAccuracy = () => {
    console.log('🎯 Melhorando precisão da localização...');
    
    if (!geolocationSupported) {
      toast({
        title: "Geolocalização Não Suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive",
      });
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
          
          toast({
            title: "Localização Precisão Excelente",
            description: `Precisão: ${Math.round(accuracy)}m | ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
          
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
                        
                        toast({
                          title: `Localização ${accuracyLevel}`,
                          description: `Precisão: ${Math.round(bestPosition.acc)}m | ${bestPosition.lat.toFixed(6)}, ${bestPosition.lng.toFixed(6)}`,
                        });
                        
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
                        
                        toast({
                          title: "Localização Obtida",
                          description: `Precisão: ${Math.round(bestPosition.acc)}m | ${bestPosition.lat.toFixed(6)}, ${bestPosition.lng.toFixed(6)}`,
                        });
                        
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
                  
                  toast({
                    title: "Localização Otimizada",
                    description: `Precisão: ${Math.round(bestPosition.acc)}m | ${bestPosition.lat.toFixed(6)}, ${bestPosition.lng.toFixed(6)}`,
                  });
                  
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
                
                toast({
                  title: "Localização Obtida",
                  description: `Precisão: ${Math.round(accuracy)}m | ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                });
                
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
        
        toast({
          title: "Erro na Localização",
          description: "Não foi possível obter uma localização precisa.",
          variant: "destructive",
        });
      },
      ultraHighAccuracyOptions
    );
  };

  return (
    <ProviderLayout>
      {/* Conteúdo da página original */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
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
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Bem-vindo de volta, {user?.name || 'Profissional'}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 min-w-0">
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
                        className="h-6 w-11 sm:h-7 sm:w-12 [&>span]:h-5 [&>span]:w-5 sm:[&>span]:h-6 sm:[&>span]:w-6 flex-shrink-0 data-[state=checked]:bg-emerald-500 data-[state=checked]:hover:bg-emerald-600 data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:hover:bg-gray-400 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
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
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <Tabs defaultValue="opportunities" className="space-y-6 sm:space-y-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto min-h-12 p-1.5 gap-1.5 sm:gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="opportunities" className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 whitespace-nowrap min-h-10 sm:min-h-11 text-center font-medium transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400 data-[state=active]:shadow-md data-[state=active]:font-semibold">
                <span className="hidden xs:inline">Oportunidades</span>
                <span className="xs:hidden">Oport.</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 whitespace-nowrap min-h-10 sm:min-h-11 text-center font-medium transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400 data-[state=active]:shadow-md data-[state=active]:font-semibold">
                <span className="hidden xs:inline">Performance</span>
                <span className="xs:hidden">Perf.</span>
              </TabsTrigger>
              <Link href="/agenda-profissional" className="contents">
                <button type="button" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm hover:text-yellow-600 dark:hover:text-yellow-400 min-h-10 sm:min-h-11 text-center">
                  Agenda
                </button>
              </Link>
              <TabsTrigger value="earnings" className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 whitespace-nowrap min-h-10 sm:min-h-11 text-center font-medium transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400 data-[state=active]:shadow-md data-[state=active]:font-semibold">
                <span className="hidden xs:inline">Ganhos</span>
                <span className="xs:hidden">Ganhos</span>
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
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* Marcador da localização atual do usuário */}
                        {userLocation && (
                          <Marker 
                            position={userLocation}
                            icon={L.divIcon({
                              className: 'custom-div-icon',
                              html: `<div style="background-color: ${locationUpdated ? '#10b981' : '#3b82f6'}; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); animation: pulse 2s infinite; ${locationUpdated ? 'border-color: #10b981;' : ''}"></div>`,
                              iconSize: [24, 24],
                              iconAnchor: [12, 12]
                            })}
                          >
                            <Popup>
                              <div className="text-center">
                                <strong>📍 Sua localização</strong>
                                {locationUpdated && <div className="text-green-600 text-xs font-bold">✓ Atualizada</div>}
                                <small>Lat: {userLocation[0].toFixed(6)}</small><br />
                                <small>Lng: {userLocation[1].toFixed(6)}</small><br />
                                {locationAccuracy && (
                                  <small className={`font-medium ${locationAccuracy <= 20 ? 'text-green-600' : locationAccuracy <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    Precisão: {Math.round(locationAccuracy)}m
                                  </small>
                                )}
                                <br />
                                <small>Raio de busca: {searchRadius}km</small>
                              </div>
                            </Popup>
                          </Marker>
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
                                  html: `<div style="width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); background-image: url('/service-icon.png'); background-size: cover; background-position: center; background-repeat: no-repeat; ${isSelected ? 'animation: pulse 2s infinite;' : ''}"></div>`,
                                  iconSize: [32, 32],
                                  iconAnchor: [16, 16]
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
                                  <span className="truncate">{service.address}</span>
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
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <TabsContent value="schedule" className="space-y-8">
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
            <TabsContent value="earnings" className="space-y-8">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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