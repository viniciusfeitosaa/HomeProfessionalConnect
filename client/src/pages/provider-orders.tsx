import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Search, Filter, Clock, MapPin, DollarSign, 
  User, Calendar, Star, CheckCircle, XCircle, AlertCircle,
  MessageCircle, Phone, CalendarDays, Navigation, Loader2
} from "lucide-react";
import { ProviderLayout } from "@/components/ProviderLayout";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-config";

interface Order {
  id: number;
  clientName: string;
  serviceType: string;
  location: string;
  distance: number;
  urgency: "high" | "medium" | "low";
  budget: number;
  description: string;
  timePosted: string;
  responses: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  clientRating?: number;
  clientPhone?: string;
  scheduledDate?: string;
}

export default function ProviderOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/provider/orders`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Erro ao buscar pedidos:', response.statusText);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "accepted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendente";
      case "accepted": return "Aceito";
      case "rejected": return "Rejeitado";
      case "completed": return "Concluído";
      default: return "Desconhecido";
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

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return "Desconhecida";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || order.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      const response = await fetch(`${getApiUrl()}/api/provider/orders/${orderId}/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Pedido aceito com sucesso!",
        });
        // Refresh orders list
        fetchOrders();
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Erro ao aceitar pedido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao aceitar pedido",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      const response = await fetch(`${getApiUrl()}/api/provider/orders/${orderId}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Pedido rejeitado com sucesso!",
        });
        // Refresh orders list
        fetchOrders();
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Erro ao rejeitar pedido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao rejeitar pedido:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao rejeitar pedido",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleContactClient = (orderId: number) => {
    console.log(`Entrando em contato com cliente do pedido ${orderId}`);
    // Implementar lógica de contato
  };

  return (
    <ProviderLayout>
      {/* Conteúdo da página original */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Meus Pedidos</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
              >
                Todos
              </Button>
              <Button
                variant={selectedFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("pending")}
              >
                Pendentes
              </Button>
              <Button
                variant={selectedFilter === "accepted" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("accepted")}
              >
                Aceitos
              </Button>
              <Button
                variant={selectedFilter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("completed")}
              >
                Concluídos
              </Button>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Carregando pedidos...
                </h3>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? "Tente ajustar sua busca" : "Você ainda não tem pedidos"}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {order.clientName}
                          </h3>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.serviceType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          R$ {order.budget}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.timePosted}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {order.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{order.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="h-4 w-4" />
                        <span>{order.distance}km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{order.responses} respostas</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getUrgencyColor(order.urgency)}>
                        {getUrgencyText(order.urgency)}
                      </Badge>
                      {order.clientRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{order.clientRating}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAcceptOrder(order.id)}
                            disabled={actionLoading === order.id}
                          >
                            {actionLoading === order.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Aceitar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectOrder(order.id)}
                            disabled={actionLoading === order.id}
                          >
                            {actionLoading === order.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Rejeitar
                          </Button>
                        </>
                      )}
                      
                      {order.status === "accepted" && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleContactClient(order.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Entrar em Contato
                        </Button>
                      )}

                      {order.clientPhone && (
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Ligar
                        </Button>
                      )}
                    </div>

                    {order.scheduledDate && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Agendado para: {order.scheduledDate}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
} 