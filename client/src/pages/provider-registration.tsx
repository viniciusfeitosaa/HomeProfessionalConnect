import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, Phone, Mail, MapPin, Award, Clock, DollarSign, 
  FileText, Camera, CheckCircle, ArrowRight, Upload, Shield 
} from "lucide-react";
import { LifeBeeLogo } from "@/components/lifebee-logo";

const serviceCategories = {
  fisioterapeuta: {
    name: "Fisioterapeuta",
    icon: "🏃‍♂️",
    subServices: [
      { id: "terapias_especializadas", name: "Terapias Especializadas" }
    ]
  },
  acompanhante_hospitalar: {
    name: "Acompanhante Hospitalar", 
    icon: "🏥",
    subServices: [
      { id: "acompanhamento_hospitalar", name: "Acompanhamento Hospitalar" },
      { id: "companhia_apoio_emocional", name: "Companhia e Apoio Emocional" }
    ]
  },
  tecnico_enfermagem: {
    name: "Técnico em Enfermagem",
    icon: "💉", 
    subServices: [
      { id: "curativos_medicacao", name: "Curativos e Medicação" },
      { id: "preparacao_refeicoes", name: "Preparação de Refeições" },
      { id: "compras_transporte", name: "Compras e Transporte" },
      { id: "lavanderia_limpeza", name: "Lavanderia e Limpeza" }
    ]
  }
};

// Phone Verification Component
function PhoneVerification({ phone }: { phone: string }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const sendVerificationCode = () => {
    // Simular envio do código
    setIsCodeSent(true);
    console.log(`Código enviado para ${phone}`);
    
    // Simular countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const verifyCode = () => {
    // Simular verificação do código
    if (verificationCode === "123456") {
      setIsVerified(true);
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-800 dark:text-green-200">Telefone verificado com sucesso!</span>
      </div>
    );
  }

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Verificação de Telefone</span>
      </div>
      
      {!isCodeSent ? (
        <div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
            Enviaremos um código de verificação via WhatsApp
          </p>
          <Button size="sm" onClick={sendVerificationCode} className="w-full">
            Enviar Código de Verificação
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Código enviado para {phone}
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código (123456)"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="text-sm"
            />
            <Button size="sm" onClick={verifyCode} disabled={verificationCode.length < 6}>
              Verificar
            </Button>
          </div>
          {timeLeft > 0 && (
            <p className="text-xs text-gray-500">Reenviar em {timeLeft}s</p>
          )}
        </div>
      )}
    </div>
  );
}

interface ProviderRegistrationProps {
  onComplete: () => void;
}

export default function ProviderRegistration({ onComplete }: ProviderRegistrationProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    name: "",
    email: "",
    phone: "",
    address: "",
    // Professional Info
    category: "",
    subService: "",
    specialization: "",
    description: "",
    experience: "",
    certifications: "",
    hourlyRate: "",
    // Documents
    profileImage: null as File | null,
    documents: [] as File[]
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete registration
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Informações Pessoais</h2>
              <p className="text-gray-600">Vamos começar com seus dados básicos</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="pl-10 py-3"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="E-mail profissional"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="pl-10 py-3"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className="pl-10 py-3"
                    required
                  />
                </div>
                {formData.phone && formData.phone.length >= 10 && (
                  <PhoneVerification phone={formData.phone} />
                )}
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Cidade, Estado"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  className="pl-10 py-3"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Área de Atuação</h2>
              <p className="text-gray-600">Selecione sua especialidade profissional</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria Principal</label>
                <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua área de atuação" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(serviceCategories).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.category && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Serviço Específico</label>
                  <Select value={formData.subService} onValueChange={(value) => updateFormData("subService", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço específico" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories[formData.category as keyof typeof serviceCategories]?.subServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Especialização</label>
                <Input
                  placeholder="Ex: Fisioterapia respiratória, Reabilitação neurológica..."
                  value={formData.specialization}
                  onChange={(e) => updateFormData("specialization", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Descrição dos Serviços</label>
                <Textarea
                  placeholder="Descreva em detalhes como você realiza seus serviços, metodologia e diferenciais..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Experiência e Qualificações</h2>
              <p className="text-gray-600">Conte-nos sobre sua experiência profissional</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Ex: 5 anos"
                  value={formData.experience}
                  onChange={(e) => updateFormData("experience", e.target.value)}
                  className="pl-10"
                />
                <label className="text-sm font-medium mb-2 block">Tempo de Experiência</label>
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="number"
                  placeholder="80.00"
                  value={formData.hourlyRate}
                  onChange={(e) => updateFormData("hourlyRate", e.target.value)}
                  className="pl-10"
                />
                <label className="text-sm font-medium mb-2 block">Valor por Hora (R$)</label>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certificações e Qualificações
                </label>
                <Textarea
                  placeholder="Liste suas certificações, cursos e qualificações relevantes..."
                  rows={4}
                  value={formData.certifications}
                  onChange={(e) => updateFormData("certifications", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Documentação</h2>
              <p className="text-gray-600">Adicione sua foto e documentos profissionais</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Foto de Perfil
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Clique para adicionar uma foto profissional</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG até 2MB</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos Profissionais
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Adicione diplomas, certificados e registros profissionais</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG até 5MB cada</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Revisão dos Dados
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Nome:</strong> {formData.name}</p>
                  <p><strong>Categoria:</strong> {formData.category && serviceCategories[formData.category as keyof typeof serviceCategories]?.name}</p>
                  <p><strong>Especialização:</strong> {formData.specialization}</p>
                  <p><strong>Experiência:</strong> {formData.experience}</p>
                  <p><strong>Valor/Hora:</strong> R$ {formData.hourlyRate}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-orange-500 to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <LifeBeeLogo size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro do Profissional</h1>
          <p className="text-white/80 text-sm">Junte-se à nossa rede de profissionais de saúde</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm">Etapa {step} de {totalSteps}</span>
            <span className="text-white/80 text-sm">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Voltar
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                {step === totalSteps ? "Finalizar Cadastro" : "Continuar"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}