import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  ArrowLeft, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  Camera,
  Save,
  Trash2,
  LogOut,
  Info,
  Star,
  Heart,
  MessageSquare,
  Calendar,
  CreditCard,
  HelpCircle,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LifeBeeLogo } from "@/components/lifebee-logo";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    bio: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    appointments: true,
    messages: true,
    promotions: false,
    emailUpdates: true,
    smsAlerts: true
  });

  const handleSaveProfile = async () => {
    try {
      const response = await apiRequest('PUT', '/api/user/profile', formData);
      if (response.ok) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('PUT', '/api/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.ok) {
        toast({
          title: "Senha alterada",
          description: "Sua senha foi atualizada com sucesso.",
        });
        setShowChangePassword(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Desconectado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await apiRequest('DELETE', '/api/user/account');
      if (response.ok) {
        logout();
        toast({
          title: "Conta excluída",
          description: "Sua conta foi excluída permanentemente.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-3 mb-6">
            <LifeBeeLogo size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
              <p className="text-gray-600 dark:text-gray-300">Gerencie sua conta e preferências</p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-yellow-600" />
              Perfil
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {user?.userType === 'client' ? 'Cliente' : 'Profissional'}
                </Badge>
              </div>
              {isEditing && (
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button onClick={handleSaveProfile} className="bg-yellow-500 hover:bg-yellow-600">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Agendamentos</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Receber notificações sobre consultas</p>
                </div>
                <Switch
                  checked={notifications.appointments}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, appointments: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Mensagens</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Notificações de novas mensagens</p>
                </div>
                <Switch
                  checked={notifications.messages}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, messages: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Promoções</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Ofertas e descontos especiais</p>
                </div>
                <Switch
                  checked={notifications.promotions}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, promotions: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Receber atualizações por email</p>
                </div>
                <Switch
                  checked={notifications.emailUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, emailUpdates: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">SMS</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Alertas importantes via SMS</p>
                </div>
                <Switch
                  checked={notifications.smsAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, smsAlerts: checked})
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-yellow-600" /> : <Sun className="h-5 w-5 text-yellow-600" />}
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Modo Escuro</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Alternar entre tema claro e escuro</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="w-full justify-start"
            >
              <Lock className="h-4 w-4 mr-2" />
              Alterar Senha
            </Button>

            {showChangePassword && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Senha Atual</label>
                  <div className="relative mt-1">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</label>
                  <div className="relative mt-1">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nova Senha</label>
                  <div className="relative mt-1">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                    Alterar Senha
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowChangePassword(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-yellow-600" />
              Sobre o App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <div className="text-center space-y-2">
                <LifeBeeLogo size={64} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">LifeBee</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Versão 1.0.0</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Conectando você com profissionais de saúde qualificados
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Star className="h-8 w-8 text-yellow-500 mx-auto" />
                <h4 className="font-medium text-gray-900 dark:text-white">4.9/5</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">Avaliação média</p>
              </div>
              <div className="space-y-2">
                <Heart className="h-8 w-8 text-red-500 mx-auto" />
                <h4 className="font-medium text-gray-900 dark:text-white">10k+</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">Usuários ativos</p>
              </div>
              <div className="space-y-2">
                <MessageSquare className="h-8 w-8 text-blue-500 mx-auto" />
                <h4 className="font-medium text-gray-900 dark:text-white">24/7</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">Suporte</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Central de Ajuda
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Falar com Suporte
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Termos de Uso
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Política de Privacidade
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDeleteAccount(!showDeleteAccount)}
              className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Conta
            </Button>

            {showDeleteAccount && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Tem certeza que deseja excluir sua conta?
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                  Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                  >
                    Sim, Excluir Conta
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteAccount(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}