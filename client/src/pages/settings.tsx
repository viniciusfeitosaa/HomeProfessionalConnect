import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  ArrowLeft, 
  Edit3, 
  Camera,
  Save,
  Trash2,
  LogOut,
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
      <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Configurações</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <LifeBeeLogo size={24} className="sm:w-8 sm:h-8" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Gerencie sua conta e preferências</p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              Perfil
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs sm:text-sm"
            >
              <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{user?.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{user?.email}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {user?.userType === 'client' ? 'Cliente' : 'Profissional'}
                </Badge>
              </div>
              {isEditing && (
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>

            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 h-9 sm:h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 h-9 sm:h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1 h-9 sm:h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-1 h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    rows={3}
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button onClick={handleSaveProfile} className="bg-yellow-500 hover:bg-yellow-600 text-sm">
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Agendamentos</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Receber notificações sobre consultas</p>
                </div>
                <Switch
                  checked={notifications.appointments}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, appointments: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Mensagens</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Notificações de novas mensagens</p>
                </div>
                <Switch
                  checked={notifications.messages}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, messages: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Promoções</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Ofertas e descontos especiais</p>
                </div>
                <Switch
                  checked={notifications.promotions}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, promotions: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Email</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Receber atualizações por email</p>
                </div>
                <Switch
                  checked={notifications.emailUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, emailUpdates: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">SMS</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Alertas importantes via SMS</p>
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
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              {theme === 'dark' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />}
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Modo Escuro</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Alternar entre tema claro e escuro</p>
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
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="w-full justify-start text-sm"
            >
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Alterar Senha
            </Button>

            {showChangePassword && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Senha Atual</label>
                  <div className="relative mt-1">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="h-9 sm:h-10 text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-9 sm:h-10 w-9 sm:w-10 p-0 hover:bg-transparent"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</label>
                  <div className="relative mt-1">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="h-9 sm:h-10 text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-9 sm:h-10 w-9 sm:w-10 p-0 hover:bg-transparent"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nova Senha</label>
                  <div className="relative mt-1">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="h-9 sm:h-10 text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-9 sm:h-10 w-9 sm:w-10 p-0 hover:bg-transparent"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button onClick={handleChangePassword} className="bg-yellow-500 hover:bg-yellow-600 text-sm">
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Alterar Senha
                  </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-red-600 dark:text-red-400">
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1">Excluir Conta</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
                Esta ação não pode ser desfeita. Sua conta será permanentemente removida.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAccount(true)}
                className="text-sm"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="pt-4 sm:pt-6">
            <Button
              variant="outline"
              onClick={handleLogout}
            className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 text-sm"
            >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Sair da Conta
            </Button>
              </div>
      </div>
    </div>
  );
}