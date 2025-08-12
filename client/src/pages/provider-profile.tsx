import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Settings, 
  CreditCard, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Edit, 
  Camera, 
  ArrowLeft, 
  Star,
  Calendar,
  Clock,
  Award,
  DollarSign,
  Map,
  User,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { getApiUrl } from "@/lib/api-config";
import { ProviderLayout } from "@/components/ProviderLayout";


interface ProfessionalData {
  id: number;
  userId: number;
  name: string;
  specialization: string;
  category: string;
  subCategory: string;
  description: string;
  experience: string;
  certifications: string;
  availableHours: string;
  hourlyRate: string;
  rating: string;
  totalReviews: number;
  location: string;
  distance: string;
  available: boolean;
  imageUrl: string;
  createdAt: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  userType: string;
  isVerified: boolean;
}

export default function ProviderProfile() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    category: "",
    subCategory: "",
    description: "",
    experience: "",
    certifications: "",
    hourlyRate: "",
    location: "",
    available: true
  });

  useEffect(() => {
    if (user?.userType === "provider") {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fetch professional data
      const professionalResponse = await fetch(`${getApiUrl()}/api/provider/profile`, {
        credentials: 'include',
        headers,
      });
      
      if (professionalResponse.ok) {
        const professional = await professionalResponse.json();
        setProfessionalData(professional);
        
        // Set form data
        setFormData({
          name: professional.name || "",
          email: professional.email || "",
          phone: professional.phone || "",
          specialization: professional.specialization || "",
          category: professional.category || "",
          subCategory: professional.subCategory || "",
          description: professional.description || "",
          experience: professional.experience || "",
          certifications: professional.certifications || "",
          hourlyRate: professional.hourlyRate || "",
          location: professional.location || "",
          available: professional.available || true
        });
      }
      
      // Fetch user data
      const userResponse = await fetch(`${getApiUrl()}/api/user`, {
        credentials: 'include',
        headers,
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserData(userData);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${getApiUrl()}/api/provider/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!",
        });
        setEditing(false);
        fetchProfileData(); // Reload data
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Erro ao atualizar perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao salvar perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original values
    if (professionalData && userData) {
      setFormData({
        name: professionalData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        specialization: professionalData.specialization || "",
        category: professionalData.category || "",
        subCategory: professionalData.subCategory || "",
        description: professionalData.description || "",
        experience: professionalData.experience || "",
        certifications: professionalData.certifications || "",
        hourlyRate: professionalData.hourlyRate || "",
        location: professionalData.location || "",
        available: professionalData.available || true
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingImage(true);
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch(`${getApiUrl()}/api/provider/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the professional data with new image URL
        if (professionalData) {
          setProfessionalData({
            ...professionalData,
            imageUrl: result.imageUrl
          });
        }

        toast({
          title: "Sucesso",
          description: "Imagem de perfil atualizada com sucesso!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Erro ao fazer upload da imagem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const getCategoryName = (category: string) => {
    const categories = {
      fisioterapeuta: "Fisioterapeuta",
      acompanhante_hospitalar: "Acompanhante Hospitalar",
      tecnico_enfermagem: "Técnico de Enfermagem"
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getSubCategoryName = (subCategory: string) => {
    const subCategories = {
      companhia_apoio_emocional: "Companhia e Apoio Emocional",
      preparacao_refeicoes: "Preparação de Refeições",
      compras_transporte: "Compras e Transporte",
      lavanderia_limpeza: "Lavanderia e Limpeza",
      curativos_medicacao: "Curativos e Medicação",
      terapias_especializadas: "Terapias Especializadas",
      acompanhamento_hospitalar: "Acompanhamento Hospitalar"
    };
    return subCategories[subCategory as keyof typeof subCategories] || subCategory;
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <div className="w-full max-w-sm lg:max-w-none mx-auto lg:mx-0 relative px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/provider-dashboard")}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
            </div>
            
            {!editing ? (
              <Button onClick={() => setEditing(true)} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} size="sm" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {professionalData && (
            <>
              {/* Profile Header */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="w-24 h-24 mx-auto border-4 border-yellow-500">
                        <AvatarImage 
                          src={professionalData.imageUrl ? `${getApiUrl()}${professionalData.imageUrl}` : undefined} 
                          alt={professionalData.name}
                        />
                        <AvatarFallback className="bg-yellow-500 text-white text-2xl font-bold">
                          {professionalData.name?.charAt(0) || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0 bg-white border-2 border-gray-200 hover:bg-gray-50"
                        onClick={triggerImageUpload}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {editing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="text-center text-2xl font-bold"
                        />
                      ) : (
                        professionalData.name
                      )}
                    </h2>
                    
                    <p className="text-lg text-primary font-semibold mb-2">
                      {editing ? (
                        <Input
                          value={formData.specialization}
                          onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                          className="text-center text-lg"
                        />
                      ) : (
                        professionalData.specialization
                      )}
                    </p>
                    
                    <div className="flex justify-center gap-6 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{professionalData.totalReviews}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avaliações</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{professionalData.rating}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nota</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          R$ {parseFloat(professionalData.hourlyRate || "0").toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hora</p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Badge 
                        variant={professionalData.available ? "secondary" : "outline"}
                        className={`${
                          professionalData.available 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {professionalData.available ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Disponível
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Indisponível
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Profissionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Categoria</Label>
                      {editing ? (
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                            <SelectItem value="acompanhante_hospitalar">Acompanhante Hospitalar</SelectItem>
                            <SelectItem value="tecnico_enfermagem">Técnico de Enfermagem</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium">{getCategoryName(professionalData.category)}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Subcategoria</Label>
                      {editing ? (
                        <Select 
                          value={formData.subCategory} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, subCategory: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a subcategoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="companhia_apoio_emocional">Companhia e Apoio Emocional</SelectItem>
                            <SelectItem value="preparacao_refeicoes">Preparação de Refeições</SelectItem>
                            <SelectItem value="compras_transporte">Compras e Transporte</SelectItem>
                            <SelectItem value="lavanderia_limpeza">Lavanderia e Limpeza</SelectItem>
                            <SelectItem value="curativos_medicacao">Curativos e Medicação</SelectItem>
                            <SelectItem value="terapias_especializadas">Terapias Especializadas</SelectItem>
                            <SelectItem value="acompanhamento_hospitalar">Acompanhamento Hospitalar</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium">{getSubCategoryName(professionalData.subCategory)}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    {editing ? (
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva seus serviços..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">{professionalData.description}</p>
                    )}
                  </div>

                  <div>
                    <Label>Experiência</Label>
                    {editing ? (
                      <Textarea
                        value={formData.experience}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="Descreva sua experiência..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">{professionalData.experience || "Não informado"}</p>
                    )}
                  </div>

                  <div>
                    <Label>Certificações</Label>
                    {editing ? (
                      <Textarea
                        value={formData.certifications}
                        onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                        placeholder="Liste suas certificações..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">{professionalData.certifications || "Não informado"}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Valor por Hora (R$)</Label>
                      {editing ? (
                        <Input
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                          placeholder="0.00"
                        />
                      ) : (
                        <p className="font-medium">R$ {parseFloat(professionalData.hourlyRate || "0").toFixed(2)}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Localização</Label>
                      {editing ? (
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Sua localização"
                        />
                      ) : (
                        <p className="font-medium">{professionalData.location || "Não informado"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      {editing ? (
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      ) : (
                        <p className="font-medium">{userData?.email || "Não informado"}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Telefone</p>
                      {editing ? (
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      ) : (
                        <p className="font-medium">{userData?.phone || "Não informado"}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Endereço</p>
                      <p className="font-medium">{professionalData.location || "Não informado"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card className="mb-6 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {userData?.isVerified ? "Conta Verificada" : "Conta Pendente"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userData?.isVerified 
                            ? "Sua identidade foi confirmada com sucesso"
                            : "Aguardando verificação da identidade"
                          }
                        </p>
                      </div>
                    </div>
                    <Badge className={`${
                      userData?.isVerified 
                        ? "bg-green-500 text-white" 
                        : "bg-yellow-500 text-white"
                    } shadow-md hover:opacity-90 transition-opacity`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {userData?.isVerified ? "✓" : "⏳"}
                        </span>
                        <span>{userData?.isVerified ? "Verificado" : "Pendente"}</span>
                      </div>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Logout Section */}
              <Card className="mb-6 border-red-100 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <LogOut className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          Sair da Conta
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Encerre sua sessão e saia do aplicativo
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ProviderLayout>
  );
} 