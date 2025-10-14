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
  taxpayerId?: string;
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
    taxpayerId: "",
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
      
      const token = sessionStorage.getItem('token');
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
        
        // Parte profissional do form será preenchida abaixo após carregar /api/user
      }
      
      // Fetch user data
      const userResponse = await fetch(`${getApiUrl()}/api/user`, {
        credentials: 'include',
        headers,
      });
      
      if (userResponse.ok) {
        const uData = await userResponse.json();
        setUserData(uData);
        // Completar form com dados do usuário + profissionais
        setFormData(prev => ({
          name: (prev.name || professionalData?.name || uData.name || ""),
          email: (uData.email || prev.email || ""),
          phone: (uData.phone || prev.phone || ""),
          taxpayerId: (prev.taxpayerId || uData.taxpayerId || localStorage.getItem('lb_report_taxpayer_id') || ""),
          specialization: (professionalData?.specialization || prev.specialization || ""),
          category: (professionalData?.category || prev.category || ""),
          subCategory: (professionalData?.subCategory || prev.subCategory || ""),
          description: (professionalData?.description || prev.description || ""),
          experience: (professionalData?.experience || prev.experience || ""),
          certifications: (professionalData?.certifications || prev.certifications || ""),
          hourlyRate: (professionalData?.hourlyRate || prev.hourlyRate || ""),
          location: (professionalData?.location || uData.address || prev.location || ""),
          available: (professionalData?.available ?? prev.available ?? true)
        }));
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
      
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // 1) Atualizar dados do usuário (nome, email, telefone, endereço baseado em location)
      const userPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.location,
      };
      const userResp = await fetch(`${getApiUrl()}/api/user/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(userPayload),
      });

      // 2) Atualizar dados profissionais (apenas campos do perfil do profissional)
      const providerPayload = {
        name: formData.name,
        specialization: formData.specialization,
        category: formData.category,
        subCategory: formData.subCategory,
        description: formData.description,
        experience: formData.experience,
        certifications: formData.certifications,
        hourlyRate: formData.hourlyRate,
        location: formData.location,
        available: formData.available,
      };
      const providerResp = await fetch(`${getApiUrl()}/api/provider/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(providerPayload),
      });

      if (userResp.ok && providerResp.ok) {
        try { localStorage.setItem('lb_report_taxpayer_id', (formData.taxpayerId || '').trim()); } catch {}
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!",
        });
        setEditing(false);
        await fetchProfileData(); // Reload data
      } else {
        let message = 'Erro ao atualizar perfil';
        try {
          const error1 = !userResp.ok ? await userResp.json() : null;
          const error2 = !providerResp.ok ? await providerResp.json() : null;
          message = (error1?.message || error2?.message) || message;
        } catch {}
        toast({
          title: "Erro",
          description: message,
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
        taxpayerId: formData.taxpayerId || "",
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
      
      const token = sessionStorage.getItem('token');
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
    window.location.href = "/";
  };

  // ===== Validações e status de verificação (mesmo modelo da tela do cliente) =====
  const isValidEmail = (val: string) => /.+@.+\..+/.test((val || '').trim());
  const isValidPhone = (val: string) => {
    const digits = (val || '').replace(/\D/g, "");
    if (digits.length !== 11) return false;
    if (digits[0] === '0' || digits[1] === '0') return false;
    if (digits[2] !== '9') return false;
    return true;
  };
  const isValidCPF = (cpfRaw: string) => {
    const cpf = (cpfRaw || '').replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    const calc = (base: number) => {
      let sum = 0; for (let i = 0; i < base; i++) sum += parseInt(cpf[i], 10) * (base + 1 - i);
      const rest = (sum * 10) % 11; return rest === 10 ? 0 : rest;
    };
    return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10);
  };
  const isValidCNPJ = (cnpjRaw: string) => {
    const cnpj = (cnpjRaw || '').replace(/\D/g, '');
    if (!cnpj || cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    const calcDigit = (base: string, weights: number[]) => {
      const sum = base.split('').reduce((acc, num, idx) => acc + parseInt(num, 10) * weights[idx], 0);
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };
    const d1 = calcDigit(cnpj.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]);
    const d2 = calcDigit(cnpj.slice(0, 12) + d1.toString(), [6,5,4,3,2,9,8,7,6,5,4,3,2]);
    return d1 === parseInt(cnpj[12], 10) && d2 === parseInt(cnpj[13], 10);
  };
  const emailOk = isValidEmail(userData?.email || formData.email);
  const phoneOk = isValidPhone(userData?.phone || formData.phone);
  const cpfSource = formData.taxpayerId || userData?.taxpayerId || localStorage.getItem('lb_report_taxpayer_id') || '';
  const docOk = isValidCPF(cpfSource) || isValidCNPJ(cpfSource);
  const completed = [emailOk, phoneOk, docOk].filter(Boolean).length;

  const getCategoryName = (category: string) => {
    const categories = {
      acompanhante_hospitalar: "Acompanhante Hospitalar",
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getSubCategoryName = (subCategory: string) => {
    const subCategories = {
      companhia_apoio_emocional: "Companhia e Apoio Emocional",
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
              <button
                onClick={() => setLocation("/provider-dashboard")}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
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
                        <p className="text-2xl font-bold text-primary">{professionalData.totalReviews || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avaliações</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{professionalData.rating || '0.0'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nota</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          R$ {parseFloat(professionalData.hourlyRate || "0").toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">/Hora</p>
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
                  <div>
                    <Label>CPF/CNPJ</Label>
                    {editing ? (
                      <Input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="CPF/CNPJ"
                        value={formData.taxpayerId}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxpayerId: e.target.value }))}
                        className="bg-white dark:bg-gray-800"
                      />
                    ) : (
                      <p className="font-medium">{(formData.taxpayerId || userData?.taxpayerId || localStorage.getItem('lb_report_taxpayer_id') || '').trim() || 'Não informado'}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Categoria</Label>
                      {editing ? (
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-800">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="acompanhante_hospitalar">Acompanhante Hospitalar</SelectItem>
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
                          <SelectTrigger className="bg-white dark:bg-gray-800">
                            <SelectValue placeholder="Selecione a subcategoria" />
                          </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="companhia_apoio_emocional">Companhia e Apoio Emocional</SelectItem>
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
                          placeholder="Não informado"
                          className="bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <p className="font-medium">{(formData.email || userData?.email || '').trim() || 'Não informado'}</p>
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
                          placeholder="Não informado"
                          className="bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <p className="font-medium">{(formData.phone || userData?.phone || '').trim() || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Endereço</p>
                      {editing ? (
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Não informado"
                          className="bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <p className="font-medium">{(formData.location || professionalData.location || '').trim() || "Não informado"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status (modelo com 3 passos: Email, Telefone, CPF) */}
              <Card className={`mb-6 ${completed === 3 ? 'border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 'border-yellow-100 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${completed === 3 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full flex items-center justify-center shadow-lg`}>
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {completed === 3 ? 'Conta Verificada' : 'Verificação em andamento'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {completed === 3 ? 'Todos os dados foram validados' : `Complete ${completed}/3 etapas para verificar sua conta`}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${emailOk ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>Email</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${phoneOk ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>Telefone</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${docOk ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>CPF/CNPJ</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${completed === 3 ? 'bg-green-500' : 'bg-yellow-500'} text-white shadow-md hover:opacity-90 transition-opacity`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{completed}/3</span>
                        <span>{completed === 3 ? 'Verificado' : 'Pendente'}</span>
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