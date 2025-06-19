import { useState } from "react";
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
  X, CheckCircle, AlertCircle, Info, Heart
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

export default function ProviderDashboard() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  // Dashboard Analytics Data
  const analytics = {
    monthlyEarnings: 4850.00,
    totalServices: 23,
    averageRating: 4.8,
    responseTime: "12min",
    monthlyGrowth: 15.3,
    servicesThisWeek: 6,
    nextAppointment: "Hoje às 14:00"
  };

  // Nearby Service Requests
  const nearbyServices = [
    {
      id: 1,
      clientName: "Maria Silva",
      serviceType: "Fisioterapia Respiratória",
      location: "Vila Madalena, SP",
      distance: 1.2,
      urgency: "high",
      budget: 120,
      description: "Preciso de fisioterapia respiratória pós-COVID. Tenho dificuldades para respirar e gostaria de um acompanhamento especializado.",
      timePosted: "15 min atrás",
      responses: 3
    },
    {
      id: 2,
      clientName: "João Santos",
      serviceType: "Acompanhamento Hospitalar",
      location: "Pinheiros, SP",
      distance: 2.8,
      urgency: "medium",
      budget: 200,
      description: "Preciso de acompanhante para cirurgia de catarata amanhã no Hospital das Clínicas.",
      timePosted: "1 hora atrás",
      responses: 1
    },
    {
      id: 3,
      clientName: "Ana Costa",
      serviceType: "Curativo Domiciliar",
      location: "Jardins, SP",
      distance: 3.5,
      urgency: "low",
      budget: 80,
      description: "Troca de curativo pós-cirúrgico. Necessário por mais 1 semana, 3x por semana.",
      timePosted: "2 horas atrás",
      responses: 5
    }
  ];

  // Recent Performance Data
  const monthlyData = [
    { month: "Jan", earnings: 3200, services: 18 },
    { month: "Fev", earnings: 3800, services: 21 },
    { month: "Mar", earnings: 4200, services: 25 },
    { month: "Abr", earnings: 4500, services: 26 },
    { month: "Mai", earnings: 4850, services: 23 }
  ];

  // Notifications Data
  const notifications = [
    {
      id: 1,
      type: "service",
      title: "Nova solicitação de serviço",
      message: "Maria Silva solicitou fisioterapia respiratória na Vila Madalena",
      time: "5 min atrás",
      read: false,
      icon: Users,
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "payment",
      title: "Pagamento recebido",
      message: "Você recebeu R$ 120,00 pelo serviço com João Santos",
      time: "1 hora atrás",
      read: false,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "rating",
      title: "Nova avaliação",
      message: "Ana Costa avaliou seu serviço com 5 estrelas",
      time: "2 horas atrás",
      read: true,
      icon: Star,
      color: "text-yellow-600"
    },
    {
      id: 4,
      type: "appointment",
      title: "Lembrete de consulta",
      message: "Consulta com Pedro Silva amanhã às 14:00",
      time: "3 horas atrás",
      read: true,
      icon: Calendar,
      color: "text-purple-600"
    },
    {
      id: 5,
      type: "system",
      title: "Atualização do sistema",
      message: "Nova versão do app disponível com melhorias",
      time: "1 dia atrás",
      read: true,
      icon: Info,
      color: "text-gray-600"
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LifeBeeLogo size={32} />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Painel do Profissional</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bem-vindo de volta, Ana Carolina!</p>
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
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
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
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Mapa de Serviços Próximos</p>
                    <p className="text-sm text-gray-500">Mostrando serviços em um raio de {searchRadius}km</p>
                  </div>
                </div>

                {/* Service Requests */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Solicitações Disponíveis</h3>
                  {nearbyServices.map((service) => (
                    <Card key={service.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{service.clientName}</h4>
                              <Badge className={getUrgencyColor(service.urgency)}>
                                {service.urgency === 'high' ? 'Urgente' : 
                                 service.urgency === 'medium' ? 'Moderado' : 'Normal'}
                              </Badge>
                            </div>
                            <p className="font-medium text-primary mb-1">{service.serviceType}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{service.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {service.location} • {service.distance}km
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.timePosted}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {service.responses} respostas
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-green-600">R$ {service.budget}</p>
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
                  ))}
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
    </div>
  );
}