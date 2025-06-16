
import { User, MapPin, Phone, Mail, Star, Settings, CreditCard, Shield, HelpCircle, LogOut, Edit, Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Sidebar } from "@/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User as UserType, Appointment } from "@shared/schema";

export default function Profile() {
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const completedServices = appointments.filter(apt => 
    new Date(apt.scheduledFor) <= new Date()
  ).length;

  const handleEditProfile = () => {
    console.log("Opening profile editor");
  };

  const handleChangePhoto = () => {
    console.log("Opening photo selector");
  };

  const handlePaymentMethods = () => {
    console.log("Opening payment methods");
  };

  const handlePrivacy = () => {
    console.log("Opening privacy settings");
  };

  const handleHelp = () => {
    console.log("Opening help center");
  };

  const handleLogout = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Sidebar />
      <div className="lg:pl-64">
        <div className="w-full max-w-sm lg:max-w-none mx-auto lg:mx-0 min-h-screen relative">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="mr-2 p-2 lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meu Perfil</h1>
            </div>

            {/* Profile Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {user?.name?.charAt(0) || "G"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white border-2 border-gray-200"
                  onClick={handleChangePhoto}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {user?.name || "Gustavo Silva"}
              </h1>
              <p className="text-gray-600 mb-4">
                Membro desde Janeiro 2024
              </p>
              
              <div className="flex justify-center space-x-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{appointments.length}</p>
                  <p className="text-sm text-gray-600">Agendamentos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{completedServices}</p>
                  <p className="text-sm text-gray-600">Concluídos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">4.8</p>
                  <p className="text-sm text-gray-600">Avaliação</p>
                </div>
              </div>

              <Button onClick={handleEditProfile} className="w-full mb-6">
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </div>

            {/* Profile Information */}
            <Card className="mb-6">
              <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">gustavo@email.com</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium">(11) 99999-9999</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Endereço</p>
                <p className="font-medium">São Paulo, SP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="mb-6 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Conta Verificada</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Sua identidade foi confirmada com sucesso
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <Badge className="bg-green-500 text-white shadow-md hover:bg-green-600 transition-colors px-4 py-2 text-sm font-medium border-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">✓</span>
                    <span>Verificado</span>
                  </div>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Menu */}
        <div className="space-y-2 mb-20">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePaymentMethods}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Formas de Pagamento</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Configurações</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePrivacy}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Privacidade e Segurança</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleHelp}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Ajuda e Suporte</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-4" />

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleLogout}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <LogOut className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-500">Sair da Conta</span>
              </div>
            </CardContent>
          </Card>
            </div>
            
            <BottomNavigation />
          </div>
        </div>
      </div>
    </div>
  );
}