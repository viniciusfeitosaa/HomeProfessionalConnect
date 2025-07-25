
import { MapPin, Phone, Mail, Settings, CreditCard, Shield, HelpCircle, LogOut, Edit, Camera, ArrowLeft, Home, MessageSquare, Calendar, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType, Appointment } from "@shared/schema";
import ClientNavbar from "../components/client-navbar";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const completedServices = (appointments || []).filter(apt => 
    new Date(apt.scheduledFor) <= new Date()
  ).length;

  const handleEditProfile = () => {
    console.log("Opening profile editor");
  };

  const handleChangePhoto = () => {
    console.log("Opening photo selector");
  };

  const handlePaymentMethods = () => {
    setLocation("/payment");
  };

  const handlePrivacy = () => {
    console.log("Opening privacy settings");
  };

  const handleHelp = () => {
    console.log("Opening help center");
  };

  const handleMyRequests = () => {
    setLocation("/my-requests");
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <div className="w-full max-w-sm lg:max-w-none mx-auto lg:mx-0 relative px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center mb-4 sm:mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="mr-2 p-2 lg:hidden"
              >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Meu Perfil</h1>
            </div>

            {/* Profile Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-3 sm:mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-white">
                    {user?.name?.charAt(0) || "G"}
                </span>
              </div>
                <Button
                  size="sm"
                  variant="secondary"
                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0 bg-white border-2 border-gray-200"
                  onClick={handleChangePhoto}
                >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                {user?.name || "Gustavo Silva"}
              </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Membro desde Janeiro 2024
              </p>
              
            <div className="flex justify-center space-x-4 sm:space-x-6 mb-4 sm:mb-6">
                <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-primary">{appointments?.length || 0}</p>
                <p className="text-xs sm:text-sm text-gray-600">Agendamentos</p>
                </div>
                <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-primary">{completedServices}</p>
                <p className="text-xs sm:text-sm text-gray-600">Concluídos</p>
                </div>
                <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-primary">4.8</p>
                <p className="text-xs sm:text-sm text-gray-600">Avaliação</p>
                </div>
              </div>

            <Button onClick={handleEditProfile} className="w-full mb-4 sm:mb-6 h-10 sm:h-12 text-sm sm:text-base">
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </div>

            {/* Profile Information */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Informações Pessoais</CardTitle>
          </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Email</p>
                  <p className="font-medium text-sm sm:text-base truncate">gustavo@email.com</p>
              </div>
            </div>
            
              <hr className="border-gray-200 dark:border-gray-700" />
            
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Telefone</p>
                  <p className="font-medium text-sm sm:text-base">(11) 99999-9999</p>
              </div>
            </div>
            
              <hr className="border-gray-200 dark:border-gray-700" />
            
              <div className="flex items-center space-x-2 sm:space-x-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Endereço</p>
                  <p className="font-medium text-sm sm:text-base">São Paulo, SP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
          <Card className="mb-4 sm:mb-6 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Conta Verificada</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Sua identidade foi confirmada com sucesso
                  </p>
                </div>
              </div>
                <div className="flex-shrink-0">
                  <Badge className="bg-green-500 text-white shadow-md hover:bg-green-600 transition-colors px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium border-0">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-base sm:text-lg">✓</span>
                    <span>Verificado</span>
                  </div>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Menu */}
          <div className="space-y-2 mb-16 sm:mb-20">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleMyRequests}>
              <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Minhas Solicitações</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePaymentMethods}>
              <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Formas de Pagamento</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/settings")}>
              <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Configurações</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePrivacy}>
              <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Privacidade e Segurança</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleHelp}>
              <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Ajuda e Suporte</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>

            <hr className="border-gray-200 dark:border-gray-700 my-3 sm:my-4" />

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleLogout}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                  <span className="font-medium text-red-500 text-sm sm:text-base">Sair da Conta</span>
              </div>
            </CardContent>
          </Card>
            </div>
            
          {/* Menu Inferior Padronizado */}
          <ClientNavbar />
        </div>
      </div>
    </>
  );
}