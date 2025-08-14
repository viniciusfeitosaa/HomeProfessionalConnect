
import { useState, useRef, useEffect } from "react";
import { MapPin, Phone, Mail, Settings, CreditCard, Shield, HelpCircle, LogOut, Edit, Camera, ArrowLeft, Home, MessageSquare, Calendar, User, FileText, Save, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-config";
import type { User as UserType, Appointment } from "@shared/schema";
import ClientNavbar from "../components/client-navbar";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  cpf: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    cpf: ""
  });

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        cpf: localStorage.getItem('client_cpf') || ""
      });
    }
  }, [user]);

  const completedServices = (appointments || []).filter(apt => 
    new Date(apt.scheduledFor) <= new Date()
  ).length;

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${getApiUrl()}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Backend ainda não persiste CPF; enviamos mesmo assim e salvamos no localStorage
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      return response.json();
    },
    onSuccess: () => {
      try { localStorage.setItem('client_cpf', formData.cpf.trim()); } catch {}
      // Garante que o estado local reflita o CPF salvo
      setFormData(prev => ({ ...prev, cpf: prev.cpf.trim() }));
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mutation for uploading image
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch(`${getApiUrl()}/api/user/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsUploading(false);
      setImageError(false);
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        cpf: localStorage.getItem('client_cpf') || ""
      });
    }
  };

  // Após sair do modo de edição, sincroniza CPF do localStorage (caso tenha sido salvo)
  useEffect(() => {
    if (!isEditing) {
      try {
        const stored = localStorage.getItem('client_cpf') || '';
        if (stored && stored !== formData.cpf) {
          setFormData(prev => ({ ...prev, cpf: stored }));
        }
      } catch {}
    }
  }, [isEditing]);

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadImageMutation.mutate(file);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ===== Validações simples =====
  const isValidEmail = (val: string) => /.+@.+\..+/.test(val.trim());
  const isValidPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    // Formato nacional BR: 11 dígitos com nono dígito (9) obrigatório
    if (digits.length !== 11) return false;
    // DDD válido (não começa com 0)
    if (digits[0] === '0' || digits[1] === '0') return false;
    // Nono dígito obrigatoriamente 9
    if (digits[2] !== '9') return false;
    return true;
  };
  const isValidCPF = (cpfRaw: string) => {
    const cpf = cpfRaw.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    const calc = (base: number) => {
      let sum = 0;
      for (let i = 0; i < base; i++) sum += parseInt(cpf[i], 10) * (base + 1 - i);
      const rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    };
    const d1 = calc(9);
    const d2 = calc(10);
    return d1 === parseInt(cpf[9], 10) && d2 === parseInt(cpf[10], 10);
  };

  const emailOk = isValidEmail(formData.email);
  const phoneOk = isValidPhone(formData.phone);
  const cpfOk = isValidCPF(formData.cpf);
  const completed = [emailOk, phoneOk, cpfOk].filter(Boolean).length;

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
    window.location.href = "/";
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

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
              {user?.profileImage && !imageError ? (
                <img
                  src={`${getApiUrl()}${user.profileImage}`}
                  alt={`Foto de ${user?.name || 'Cliente'}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
                  onError={() => {
                    console.log('Erro ao carregar imagem:', user.profileImage);
                    setImageError(true);
                  }}
                  onLoad={() => {
                    console.log('Imagem carregada com sucesso:', user.profileImage);
                    setImageError(false);
                  }}
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-yellow-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {user?.name?.charAt(0) || "G"}
                  </span>
                </div>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0 bg-white border-2 border-gray-200 hover:bg-gray-50"
                onClick={handleChangePhoto}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              {user?.name || "Gustavo Silva"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              {user?.createdAt ? `Membro desde ${new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}` : 'Membro'}
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

            {!isEditing ? (
              <Button onClick={handleEditProfile} className="w-full mb-4 sm:mb-6 h-10 sm:h-12 text-sm sm:text-base">
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2 mb-4 sm:mb-6">
                <Button 
                  onClick={handleSaveProfile} 
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit} 
                  className="h-10 sm:h-12 text-sm sm:text-base"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {isEditing ? (
                // Edit mode
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-xs sm:text-sm text-gray-600">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-xs sm:text-sm text-gray-600">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-xs sm:text-sm text-gray-600">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`mt-1 ${formData.phone && !phoneOk ? 'border-red-500' : ''}`}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-xs sm:text-sm text-gray-600">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      className={`mt-1 ${formData.cpf && !cpfOk ? 'border-red-500' : ''}`}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-xs sm:text-sm text-gray-600">Endereço</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="mt-1"
                      placeholder="Seu endereço completo"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Email</p>
                      <p className="font-medium text-sm sm:text-base truncate">{(user?.email || '').trim() || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <hr className="border-gray-200 dark:border-gray-700" />
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Telefone</p>
                      <p className="font-medium text-sm sm:text-base">{(user?.phone || '').trim() || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <hr className="border-gray-200 dark:border-gray-700" />

                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">CPF</p>
                      <p className="font-medium text-sm sm:text-base">{(formData.cpf || localStorage.getItem('client_cpf') || '').trim() || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <hr className="border-gray-200 dark:border-gray-700" />
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Endereço</p>
                      <p className="font-medium text-sm sm:text-base">{(user?.address || '').trim() || 'Não informado'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className={`mb-4 sm:mb-6 ${completed === 3 ? 'border-green-100 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-yellow-100 bg-gradient-to-r from-yellow-50 to-amber-50'}`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${completed === 3 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full flex items-center justify-center shadow-lg`}>
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{completed === 3 ? 'Conta Verificada' : 'Verificação em andamento'}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {completed === 3 ? 'Todos os dados foram validados' : `Complete ${completed}/3 etapas para verificar sua conta`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${emailOk ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>Email</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${phoneOk ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>Telefone</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cpfOk ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>CPF</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Badge className={`${completed === 3 ? 'bg-green-500' : 'bg-yellow-500'} text-white shadow-md hover:opacity-90 transition-colors px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium border-0`}>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-base sm:text-lg">{completed}/3</span>
                      <span>{completed === 3 ? 'Verificado' : 'Pendente'}</span>
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