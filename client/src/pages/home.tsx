

import { useState, useEffect } from "react";
import { Bell, Search, Calendar, User as UserIcon, Star, MapPin, Phone, MessageSquare, Home as HomeIcon } from "lucide-react";
import { useLocation } from "wouter";
import { getApiUrl } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/bottom-navigation";
import ClientNavbar from "../components/client-navbar";

export default function Home() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [professionalsLoading, setProfessionalsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Buscar profissionais da API
  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setProfessionalsLoading(true);
      const response = await fetch(`${getApiUrl()}/api/professionals`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const responseData = await response.json();
        setProfessionals(responseData);
      } else {
        console.error('Erro ao buscar profissionais:', response.statusText);
        setProfessionals([]);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os profissionais",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais",
        variant: "destructive",
      });
    } finally {
      setProfessionalsLoading(false);
    }
  };

  // Função para iniciar conversa diretamente
  const startConversation = async (professionalId: number, professionalName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/messages/start-conversation`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          professionalId,
          message: `Olá! Gostaria de conversar sobre seus serviços.`
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Resposta do backend:', data); // Depuração
        toast({
          title: "Conversa iniciada!",
          description: `Você pode conversar com ${professionalName} agora`,
        });
        const conversationId = data.conversationId || data.id || data.conversationID;
        if (conversationId) {
          setLocation(`/messages/${conversationId}`);
        } else {
          setLocation('/messages');
        }
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível iniciar a conversa",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao iniciar conversa",
        variant: "destructive",
      });
    }
  };

  // Função para fazer ligação direta
  const makeCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleNavigation = (page: string) => {
    switch (page) {
      case "Home":
        setLocation("/");
        break;
      case "Chat":
        setLocation("/messages");
        break;
      case "Agenda":
        setLocation("/agenda");
        break;
      case "Perfil":
        setLocation("/profile");
        break;
      default:
        setLocation("/");
    }
  };

  // Show loading state
  if (professionalsLoading) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Carregando profissionais...</p>
        </div>
        <ClientNavbar />
      </div>
    );
  }

  // Show offline mode if there's no data
  if (professionals.length === 0) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 min-h-screen">
        <div className="flex justify-between items-center p-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Olá,</p>
            <p className="font-semibold text-base sm:text-lg text-gray-900">Usuário</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center">
            <UserIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Nenhum profissional disponível</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              No momento não há profissionais cadastrados na sua região. Tente novamente mais tarde.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-yellow-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-medium hover:bg-yellow-600 transition-colors text-sm sm:text-base"
            >
              Tentar novamente
            </button>
          </div>
        </div>

        {/* Menu Inferior */}
        <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 sm:py-3">
          {[
            { icon: HomeIcon, label: "Home" },
            { icon: MessageSquare, label: "Chat" },
            { icon: Calendar, label: "Agenda" },
            { icon: UserIcon, label: "Perfil" }
          ].map((item, index) => (
            <button 
              key={index} 
              className="flex flex-col items-center text-xs text-gray-600 hover:text-yellow-500 transition-colors"
              onClick={() => handleNavigation(item.label)}
            >
              <item.icon className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
              {item.label}
            </button>
          ))}
        </nav>
        <ClientNavbar />
      </div>
    );
  }

  // Filtrar profissionais por busca
  const filteredProfessionals = professionals.filter(professional =>
    professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    professional.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 min-h-screen">
      {/* Header Simplificado */}
      <div className="flex justify-between items-center p-3 sm:p-4">
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Olá,</p>
          <p className="font-semibold text-base sm:text-lg text-gray-900">Usuário</p>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center">
          <div className="relative">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
              3
              </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center">
            <UserIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Busca Simplificada */}
      <div className="px-3 sm:px-4 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar profissional..."
            className="w-full bg-white rounded-full px-10 sm:px-12 py-3 sm:py-4 text-sm sm:text-base text-gray-900 placeholder-gray-500 border-0 shadow-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Banner de Emergência */}
      <div className="px-3 sm:px-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-3 sm:p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg">Emergência 24h</h3>
              <p className="text-xs sm:text-sm opacity-90">Profissionais disponíveis agora</p>
          </div>
            <div className="text-2xl sm:text-3xl">🚨</div>
          </div>
        </div>
      </div>

      {/* Lista de Profissionais */}
      <div className="px-3 sm:px-4 pb-20 sm:pb-24">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
          {searchQuery ? `Resultados para "${searchQuery}"` : "Profissionais Disponíveis"}
        </h2>
        
        <div className="space-y-3 sm:space-y-4">
          {filteredProfessionals.map((professional) => (
            <div key={professional.id} className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {professional.imageUrl ? (
                    <img 
                      src={professional.imageUrl} 
                      alt={professional.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1">{professional.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-2">{professional.specialization}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {professional.rating}
                      </span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="truncate">{professional.location}</span>
        </div>
                    <div className="text-xs sm:text-sm font-medium text-green-600">
                      R$ {professional.hourlyRate}/h
        </div>
      </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      className="flex-1 bg-yellow-500 text-white py-2 px-3 sm:px-4 rounded-full font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      onClick={() => startConversation(professional.userId, professional.name)}
                    >
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                      Conversar
                    </button>
                    {professional.phone && (
                      <button 
                        className="bg-green-500 text-white py-2 px-3 sm:px-4 rounded-full font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        onClick={() => makeCall(professional.phone)}
                      >
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        Ligar
                      </button>
                    )}
                  </div>
            </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProfessionals.length === 0 && searchQuery && (
          <div className="text-center py-8 sm:py-12">
            <Search className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Nenhum profissional encontrado</p>
          </div>
        )}
        </div>

      <ClientNavbar />
    </div>
  );
}
