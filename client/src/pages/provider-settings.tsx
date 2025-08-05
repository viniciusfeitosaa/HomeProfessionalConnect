import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, User, Bell, Shield, CreditCard, MapPin, 
  Clock, DollarSign, Settings, LogOut, Moon, Sun,
  Smartphone, Mail, Globe, Lock, HelpCircle, Info, Loader2
} from "lucide-react";
import { BottomNavigationProvider } from "@/components/bottom-navigation-provider";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-config";
import { ProviderLayout } from "@/components/ProviderLayout";

export default function ProviderSettings() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: ""
  });
  
  // Availability state
  const [availability, setAvailability] = useState({
    isAvailable: true,
    workStartTime: "08:00",
    workEndTime: "18:00"
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState({
    newOrders: true,
    messages: true,
    payments: true,
    reminders: true,
    marketing: false
  });
  
  // Payments state
  const [payments, setPayments] = useState({
    bankAccount: "",
    pixKey: ""
  });

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/provider/settings`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setAvailability(data.availability);
        setNotifications(data.notifications);
        setPayments(data.payments);
      } else {
        console.error('Erro ao buscar configurações:', response.statusText);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${getApiUrl()}/api/provider/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          availability,
          notifications,
          payments
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Configurações salvas com sucesso!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Erro ao salvar configurações",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <ProviderLayout>
      {/* Conteúdo da página original */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie suas preferências</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Carregando configurações...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name" 
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialization">Especialização</Label>
                      <Input 
                        id="specialization" 
                        value={profile.specialization}
                        onChange={(e) => setProfile(prev => ({ ...prev, specialization: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={saveSettings}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Availability Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Disponibilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Disponível para Serviços</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receber solicitações de novos clientes
                  </p>
                </div>
                <Switch 
                  checked={availability.isAvailable} 
                  onCheckedChange={(value) => setAvailability(prev => ({ ...prev, isAvailable: value }))} 
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-medium">Horário de Trabalho</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Início</Label>
                    <Input 
                      type="time" 
                      value={availability.workStartTime}
                      onChange={(e) => setAvailability(prev => ({ ...prev, workStartTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Fim</Label>
                    <Input 
                      type="time" 
                      value={availability.workEndTime}
                      onChange={(e) => setAvailability(prev => ({ ...prev, workEndTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Novos Pedidos</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notificar quando receber novas solicitações
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.newOrders} 
                    onCheckedChange={(value) => handleNotificationChange('newOrders', value)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Mensagens</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notificar novas mensagens dos clientes
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.messages} 
                    onCheckedChange={(value) => handleNotificationChange('messages', value)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Pagamentos</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notificar quando receber pagamentos
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.payments} 
                    onCheckedChange={(value) => handleNotificationChange('payments', value)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Lembretes</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lembretes de consultas agendadas
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.reminders} 
                    onCheckedChange={(value) => handleNotificationChange('reminders', value)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Marketing</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Promoções e novidades da plataforma
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.marketing} 
                    onCheckedChange={(value) => handleNotificationChange('marketing', value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Conta Bancária</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {payments.bankAccount || "Não configurado"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {payments.pixKey || "Não configurado"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Smartphone className="h-4 w-4 mr-2" />
                Autenticação em Duas Etapas
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Modo Escuro</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Alternar entre tema claro e escuro
                  </p>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={(value) => setTheme(value ? "dark" : "light")} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Central de Ajuda
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Contatar Suporte
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Info className="h-4 w-4 mr-2" />
                Sobre o App
              </Button>
            </CardContent>
          </Card>

          {/* Logout Section */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair da Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProviderLayout>
  );
} 