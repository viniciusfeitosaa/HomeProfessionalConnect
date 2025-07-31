import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, MessageCircle, DollarSign, Clock, MapPin, 
  Star, Send, CheckCircle, AlertCircle, MessageSquare, Calendar, UserIcon, Home, Loader2
} from "lucide-react";
import { Link, useParams } from "wouter";
import { getApiUrl } from "@/lib/api-config";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function ServiceOffer() {
  const params = useParams();
  const serviceId = (params as any)?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [offerMessage, setOfferMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [isOfferSent, setIsOfferSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [serviceOffers, setServiceOffers] = useState<any[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  
  // Estados para o diálogo de mensagem
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Estados para o segundo diálogo de mensagem (seção de fazer proposta)
  const [isProposalMessageDialogOpen, setIsProposalMessageDialogOpen] = useState(false);
  const [proposalMessageText, setProposalMessageText] = useState("");
  const [isSendingProposalMessage, setIsSendingProposalMessage] = useState(false);

  // Dados do serviço carregados da API
  const [serviceRequest, setServiceRequest] = useState({
    id: parseInt(serviceId || "0"),
    clientName: "",
    clientAvatar: "",
    clientProfileImage: "",
    serviceType: "",
    location: "",
    distance: 0,
    urgency: "low",
    budget: 0,
    description: "",
    timePosted: "",
    responses: 0,
    preferredTime: "",
    scheduledTime: "",
    clientRating: 0,
    previousServices: 0,
    additionalDetails: "",
    additionalInfo: "",
    address: "",
    scheduledDate: "",
    status: "open",
    clientCreatedAt: ""
  });

  // Função para calcular distância entre duas coordenadas
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

  // Função para obter geolocalização do usuário
  const getUserLocation = (): Promise<[number, number] | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve([latitude, longitude]);
        },
        (error) => {
          // Silenciar erro de geolocalização
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Reduzir timeout
          maximumAge: 60000 // Permitir cache de 1 minuto
        }
      );
    });
  };

  // Função para geocodificar endereço
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    // Desabilitar geocodificação em desenvolvimento devido a problemas de CORS
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=br`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'LifeBee-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return [parseFloat(lat), parseFloat(lon)];
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Carregar dados do serviço
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) {
        setError("ID do serviço não fornecido");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Buscar dados do serviço
        const response = await fetch(`${getApiUrl()}/api/service-requests/${serviceId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erro ao carregar serviço: ${response.status}`);
        }

        const serviceData = await response.json();
        
        // Usar diretamente os dados retornados pelo backend que já incluem informações do cliente
        const serviceDataCombined = {
          id: serviceData.id,
          clientName: serviceData.clientName || "Cliente",
          clientAvatar: serviceData.clientProfileImage || "",
          clientProfileImage: serviceData.clientProfileImage || "",
          serviceType: serviceData.serviceType || "Serviço",
          location: serviceData.address || "",
          distance: 0, // Será calculado se necessário
          urgency: serviceData.urgency || "low",
          budget: serviceData.budget || 0,
          description: serviceData.description || "Descrição não disponível",
          timePosted: serviceData.createdAt || "",
          responses: serviceData.responses || 0,
          preferredTime: serviceData.scheduledTime || "Não definido",
          scheduledTime: serviceData.scheduledTime || "Não definido",
          clientRating: 5.0, // Valor padrão
          previousServices: 0, // Será calculado se necessário
          additionalDetails: serviceData.description || "",
          additionalInfo: serviceData.description || "",
          address: serviceData.address || "Endereço não informado",
          scheduledDate: serviceData.scheduledDate || "",
          status: serviceData.status || "open",
          clientCreatedAt: serviceData.clientCreatedAt || ""
        };

        setServiceRequest(serviceDataCombined);

        // Calcular distância se o endereço estiver disponível
        if (serviceDataCombined.address && serviceDataCombined.address !== "Endereço não informado") {
          setIsCalculatingDistance(true);
          
          try {
            // Obter localização do usuário
            const userCoords = await getUserLocation();
            setUserLocation(userCoords);
            
            // Geocodificar endereço do serviço
            const serviceCoords = await geocodeAddress(serviceDataCombined.address);
            
            if (serviceCoords && userCoords) {
              // Calcular distância
              const distance = calculateDistance(
                userCoords[0], userCoords[1],
                serviceCoords[0], serviceCoords[1]
              );
              
              // Atualizar distância no estado
              setServiceRequest(prev => ({
                ...prev,
                distance: Math.round(distance * 10) / 10 // Arredondar para 1 casa decimal
              }));
            } else {
              // Se não conseguir geocodificar ou obter localização, definir distância como "Não disponível"
              setServiceRequest(prev => ({
                ...prev,
                distance: -1 // Valor especial para indicar "não disponível"
              }));
            }
          } catch (error) {
            // Definir distância como "Não disponível"
            setServiceRequest(prev => ({
              ...prev,
              distance: -1
            }));
          } finally {
            setIsCalculatingDistance(false);
          }
        }

      } catch (err) {
        console.error("Erro ao carregar serviço:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do serviço",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId, toast]);

  // Buscar propostas do serviço
  useEffect(() => {
    const fetchServiceOffers = async () => {
      if (!serviceId) return;

      try {
        setIsLoadingOffers(true);
        const response = await fetch(`${getApiUrl()}/api/service-requests/${serviceId}/offers`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const offers = await response.json();
          setServiceOffers(offers);
        } else {
          console.error('Erro ao buscar propostas:', response.status);
        }
      } catch (error) {
        console.error('Erro ao buscar propostas:', error);
      } finally {
        setIsLoadingOffers(false);
      }
    };

    fetchServiceOffers();
  }, [serviceId]);

  const handleSendOffer = async () => {
    if (offerMessage.trim() && proposedPrice && estimatedTime) {
      try {
        const response = await fetch(`${getApiUrl()}/api/service-requests/${serviceId}/offers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            proposedPrice: parseFloat(proposedPrice),
            estimatedTime,
            message: offerMessage
          })
        });

        if (response.ok) {
          const result = await response.json();
          toast({
            title: "Sucesso!",
            description: "Sua proposta foi enviada com sucesso",
          });
          
          // Recarregar as propostas para incluir a nova
          const offersResponse = await fetch(`${getApiUrl()}/api/service-requests/${serviceId}/offers`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (offersResponse.ok) {
            const offers = await offersResponse.json();
            setServiceOffers(offers);
          }
          
          setIsOfferSent(true);
        } else {
          const errorData = await response.json();
          toast({
            title: "Erro",
            description: errorData.message || "Não foi possível enviar a proposta",
            variant: "destructive"
          });
        }
      } catch (err) {
        toast({
          title: "Erro",
          description: "Não foi possível enviar a proposta",
          variant: "destructive"
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem antes de enviar",
        variant: "destructive"
      });
      return;
    }

    setIsSendingMessage(true);
    try {
      // Aqui você pode implementar a lógica para enviar a mensagem
      // Por enquanto, vamos simular o envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso",
        description: "Mensagem enviada com sucesso!",
      });
      
      setMessageText("");
      setIsMessageDialogOpen(false);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendProposalMessage = async () => {
    if (!proposalMessageText.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem antes de enviar",
        variant: "destructive"
      });
      return;
    }

    setIsSendingProposalMessage(true);
    try {
      // Aqui você pode implementar a lógica para enviar a mensagem
      // Por enquanto, vamos simular o envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso",
        description: "Mensagem enviada com sucesso!",
      });
      
      setProposalMessageText("");
      setIsProposalMessageDialogOpen(false);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSendingProposalMessage(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Função para formatar tempo relativo
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `há ${Math.floor(diffInMinutes / 60)}h`;
    return `há ${Math.floor(diffInMinutes / 1440)} dias`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600 dark:text-gray-400">Carregando detalhes do serviço...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Erro ao carregar serviço
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Link href="/provider-dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleNavigation = (label: string) => {
    switch (label) {
      case "Home":
        window.location.href = "/";
        break;
      case "Chat":
        window.location.href = "/messages";
        break;
      case "Agenda":
        window.location.href = "/agenda";
        break;
      case "Perfil":
        window.location.href = "/profile";
        break;
      default:
        window.location.href = "/";
    }
  };

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
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhes do Serviço</h1>
        </div>
      </div>

             <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
         {isOfferSent ? (
           /* Success State */
           <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
             <CardContent className="p-4 sm:p-6 text-center">
               <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-3 sm:mb-4" />
               <h2 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                 Oferta Enviada com Sucesso!
               </h2>
               <p className="text-sm sm:text-base text-green-700 dark:text-green-300 mb-4">
                 Sua proposta foi enviada para {serviceRequest.clientName}. 
                 Você receberá uma notificação quando ela responder.
               </p>
               <div className="flex flex-col sm:flex-row gap-3 justify-center">
                 <Link href="/provider-dashboard">
                   <Button variant="outline" className="h-10 sm:h-11 text-sm sm:text-base">
                     Voltar ao Dashboard
                   </Button>
                 </Link>
                 <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                   <DialogTrigger asChild>
                     <Button className="h-10 sm:h-11 text-sm sm:text-base">
                       <MessageCircle className="h-4 w-4 mr-2" />
                       Enviar Mensagem
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                     <DialogHeader>
                       <DialogTitle className="text-lg sm:text-xl">Mensagem para {serviceRequest.clientName}</DialogTitle>
                     </DialogHeader>
                     <div className="space-y-4">
                       <Textarea
                         placeholder="Digite uma mensagem adicional..."
                         rows={4}
                         className="text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                         value={messageText}
                         onChange={(e) => setMessageText(e.target.value)}
                       />
                       <Button 
                         className="w-full h-10 sm:h-11 text-sm sm:text-base"
                         onClick={handleSendMessage}
                         disabled={isSendingMessage}
                       >
                         {isSendingMessage ? (
                           <>
                             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                             Enviando...
                           </>
                         ) : (
                           <>
                             <Send className="h-4 w-4 mr-2" />
                             Enviar Mensagem
                           </>
                         )}
                       </Button>
                     </div>
                   </DialogContent>
                 </Dialog>
               </div>
             </CardContent>
           </Card>
        ) : (
          <>
            {/* Service Request Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar do Cliente */}
                    {serviceRequest.clientProfileImage ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img
                          src={`${getApiUrl()}${serviceRequest.clientProfileImage}`}
                          alt={serviceRequest.clientName || 'Cliente'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Log silencioso apenas em desenvolvimento
                            if (process.env.NODE_ENV === 'development') {
                              console.log('🖼️ Imagem do cliente não encontrada:', serviceRequest.clientProfileImage);
                            }
                            // Fallback para inicial se a imagem falhar
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                  <span class="text-white text-xl font-bold">
                                    ${serviceRequest.clientName ? serviceRequest.clientName.charAt(0).toUpperCase() : 'C'}
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
                          {serviceRequest.clientName ? serviceRequest.clientName.charAt(0).toUpperCase() : 'C'}
                        </span>
                      </div>
                    )}
                    
                    {/* Informações do Cliente */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {serviceRequest.clientName || 'Cliente'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {serviceRequest.clientRating || '5.0'}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {serviceRequest.previousServices || '0'} serviços
                        </span>
                      </div>
                                             <p className="text-sm text-gray-500 mt-1">
                         Cliente desde {serviceRequest.clientCreatedAt ? 
                           new Date(serviceRequest.clientCreatedAt).getFullYear() : 
                           '2024'}
                       </p>
                    </div>
                  </div>
                  
                  {/* Status da Solicitação */}
                  <Badge className={getUrgencyColor(serviceRequest.urgency)}>
                    {serviceRequest.status === 'open' ? 'Aberta' : 
                     serviceRequest.status === 'in_progress' ? 'Em Andamento' : 
                     serviceRequest.status === 'completed' ? 'Concluída' : 'Normal'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Tipo de Serviço */}
                <div>
                  <h3 className="font-semibold text-lg text-primary mb-2">
                    {serviceRequest.serviceType || 'Serviço Solicitado'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {serviceRequest.description || 'Descrição do serviço não disponível'}
                  </p>
                </div>
                
                {/* Grid de Informações */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {/* Orçamento */}
                  <div className="text-center">
                    <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Orçamento</p>
                                         <div className="font-semibold text-green-600">
                       R$ {serviceRequest.budget ? (typeof serviceRequest.budget === 'string' ? parseFloat(serviceRequest.budget).toFixed(2) : serviceRequest.budget.toFixed(2)) : '0,00'}
                     </div>
                  </div>
                  
                  {/* Distância */}
                  <div className="text-center">
                    <MapPin className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Distância</p>
                                         <div className="font-semibold text-blue-600">
                       {isCalculatingDistance ? (
                         <div className="flex items-center justify-center gap-1">
                           <Loader2 className="h-3 w-3 animate-spin" />
                           <span>Calculando...</span>
                         </div>
                       ) : (
                         serviceRequest.distance === -1 ? 'Não disponível' : `${serviceRequest.distance || '0'} km`
                       )}
                     </div>
                  </div>
                  
                  {/* Horário */}
                  <div className="text-center">
                    <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Horário</p>
                                         <div className="font-semibold text-purple-600">
                       {serviceRequest.preferredTime || 'Não definido'}
                     </div>
                  </div>
                  
                  {/* Respostas */}
                  <div className="text-center">
                    <MessageCircle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Respostas</p>
                                         <div className="font-semibold text-orange-600">
                       {serviceRequest.responses || 0}
                     </div>
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
                       {serviceRequest.address || 'Endereço não informado'}
                     </p>
                  </div>
                  
                  {/* Data */}
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Data
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {serviceRequest.scheduledDate ? 
                        new Date(serviceRequest.scheduledDate).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Data não definida'}
                    </p>
                  </div>
                  
                  {/* Detalhes Adicionais */}
                  {serviceRequest.additionalInfo && (
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        Detalhes Adicionais
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {serviceRequest.additionalInfo}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

                         {/* Make Offer Section */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                   <Send className="h-5 w-5" />
                   Fazer Proposta
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 p-4 sm:p-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium block">Valor Proposto (R$)</label>
                     <Input
                       type="number"
                       placeholder="120.00"
                       value={proposedPrice}
                       onChange={(e) => setProposedPrice(e.target.value)}
                       className="h-10 sm:h-11 text-sm sm:text-base"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium block">Tempo Estimado</label>
                     <Input
                       placeholder="1 hora"
                       value={estimatedTime}
                       onChange={(e) => setEstimatedTime(e.target.value)}
                       className="h-10 sm:h-11 text-sm sm:text-base"
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-medium block">Mensagem da Proposta</label>
                   <Textarea
                     placeholder="Olá! Sou fisioterapeuta especializada em reabilitação respiratória pós-COVID. Tenho experiência com pacientes na sua faixa etária e posso levar equipamentos específicos para o atendimento domiciliar..."
                     rows={4}
                     value={offerMessage}
                     onChange={(e) => setOfferMessage(e.target.value)}
                     className="text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                   />
                 </div>

                 <div className="flex items-start gap-2 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                   <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                   <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                     <p className="font-medium mb-1">Dicas para uma boa proposta:</p>
                     <ul className="space-y-1">
                       <li>• Demonstre sua experiência específica no tipo de serviço</li>
                       <li>• Mencione equipamentos ou materiais que você possui</li>
                       <li>• Seja claro sobre disponibilidade e tempo de resposta</li>
                       <li>• Ofereça um valor competitivo mas justo</li>
                     </ul>
                   </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-3 pt-2">
                   <Button 
                     onClick={handleSendOffer}
                     disabled={!offerMessage.trim() || !proposedPrice || !estimatedTime}
                     className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
                   >
                     <Send className="h-4 w-4 mr-2" />
                     Enviar Proposta
                   </Button>
                   <Dialog open={isProposalMessageDialogOpen} onOpenChange={setIsProposalMessageDialogOpen}>
                     <DialogTrigger asChild>
                       <Button variant="outline" className="h-10 sm:h-11 text-sm sm:text-base">
                         <MessageCircle className="h-4 w-4 mr-2" />
                         Observações
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                       <DialogHeader>
                         <DialogTitle className="text-lg sm:text-xl">Observações para {serviceRequest.clientName}</DialogTitle>
                       </DialogHeader>
                       <div className="space-y-4">
                         <Textarea
                           placeholder="Faça uma pergunta sobre o serviço..."
                           rows={4}
                           className="text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                           value={proposalMessageText}
                           onChange={(e) => setProposalMessageText(e.target.value)}
                         />
                         <Button 
                           className="w-full h-10 sm:h-11 text-sm sm:text-base"
                           onClick={handleSendProposalMessage}
                           disabled={isSendingProposalMessage}
                         >
                           {isSendingProposalMessage ? (
                             <>
                               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                               Enviando...
                             </>
                           ) : (
                             <>
                               <Send className="h-4 w-4 mr-2" />
                               Enviar Mensagem
                             </>
                           )}
                         </Button>
                       </div>
                     </DialogContent>
                   </Dialog>
                 </div>
               </CardContent>
             </Card>

                         {/* Competition Analysis */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                   <span>Outras Propostas</span>
                   {isLoadingOffers && (
                     <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                   )}
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {serviceOffers.length === 0 ? (
                   <div className="text-center py-8">
                     <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                     <p className="text-gray-500 dark:text-gray-400">
                       {isLoadingOffers ? 'Carregando propostas...' : 'Nenhuma proposta ainda'}
                     </p>
                     <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                       Seja o primeiro a fazer uma proposta!
                     </p>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {serviceOffers.map((offer) => (
                       <div key={offer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                         <div className="flex items-center gap-3">
                           {offer.professionalProfileImage ? (
                             <div className="w-8 h-8 rounded-full overflow-hidden">
                               <img
                                 src={`${getApiUrl()}${offer.professionalProfileImage}`}
                                 alt={offer.professionalName || 'Profissional'}
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                   // Log silencioso apenas em desenvolvimento
                                   if (process.env.NODE_ENV === 'development') {
                                     console.log('🖼️ Imagem do profissional não encontrada:', offer.professionalProfileImage);
                                   }
                                   const target = e.target as HTMLImageElement;
                                   target.style.display = 'none';
                                   const parent = target.parentElement;
                                   if (parent) {
                                     parent.innerHTML = `
                                       <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                         <span class="text-white text-xs font-bold">
                                           ${offer.professionalName ? offer.professionalName.charAt(0).toUpperCase() : 'P'}
                                         </span>
                                       </div>
                                     `;
                                   }
                                 }}
                               />
                             </div>
                           ) : (
                             <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                               <span className="text-white text-xs font-bold">
                                 {offer.professionalName ? offer.professionalName.charAt(0).toUpperCase() : 'P'}
                               </span>
                             </div>
                           )}
                           <div>
                             <p className="font-medium text-sm">
                               {offer.professionalName || 'Profissional'}
                             </p>
                             <p className="text-xs text-gray-600 dark:text-gray-400">
                               ⭐ {offer.professionalRating || '5.0'} • {offer.professionalTotalReviews || '0'} serviços
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="font-semibold text-sm">
                             R$ {offer.proposedPrice ? parseFloat(offer.proposedPrice).toFixed(2) : '0,00'}
                           </p>
                           <p className="text-xs text-gray-500">
                             {formatTimeAgo(offer.createdAt)}
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </CardContent>
             </Card>
          </>
        )}
      </div>
    </div>
  );
}