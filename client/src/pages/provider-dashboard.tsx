import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, DollarSign, MapPin, Plus, Settings, Star, Users, FileText, Heart } from "lucide-react";
import { LifeBeeLogo } from "@/components/lifebee-logo";
import { useLocation } from "wouter";

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

export default function ProviderDashboard() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubService, setSelectedSubService] = useState("");
  const [serviceForm, setServiceForm] = useState({
    specialization: "",
    description: "",
    experience: "",
    certifications: "",
    hourlyRate: "",
    location: ""
  });

  const handleLogout = () => {
    setLocation("/login");
  };

  const handleSubmitService = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui enviaria os dados para o backend
    console.log("Serviço cadastrado:", { 
      category: selectedCategory,
      subService: selectedSubService,
      ...serviceForm 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <LifeBeeLogo size={32} />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">LifeBee Pro</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard do Profissional</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="services">Meus Serviços</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Agendamentos Hoje</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clientes Ativos</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avaliação</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">4.9</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita do Mês</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 2.4k</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Novo agendamento confirmado</p>
                      <p className="text-sm text-gray-500">Maria Silva - Fisioterapia - Hoje às 14:00</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Nova avaliação recebida</p>
                      <p className="text-sm text-gray-500">João Santos avaliou seu atendimento com 5 estrelas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {/* Add New Service */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Cadastrar Novo Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitService} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Categoria Principal</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

                    {selectedCategory && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Serviço Específico</label>
                        <Select value={selectedSubService} onValueChange={setSelectedSubService}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o serviço específico" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceCategories[selectedCategory as keyof typeof serviceCategories]?.subServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Especialização</label>
                    <Input
                      placeholder="Ex: Fisioterapia respiratória, Reabilitação neurológica..."
                      value={serviceForm.specialization}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, specialization: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição do Serviço</label>
                    <Textarea
                      placeholder="Descreva em detalhes como você realiza este serviço, sua metodologia e diferenciais..."
                      rows={4}
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Experiência</label>
                      <Input
                        placeholder="Ex: 5 anos"
                        value={serviceForm.experience}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, experience: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor por Hora (R$)</label>
                      <Input
                        type="number"
                        placeholder="80.00"
                        value={serviceForm.hourlyRate}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Localização</label>
                      <Input
                        placeholder="Ex: São Paulo, SP"
                        value={serviceForm.location}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Certificações</label>
                    <Textarea
                      placeholder="Liste suas certificações, cursos e qualificações relevantes..."
                      rows={3}
                      value={serviceForm.certifications}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, certifications: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Cadastrar Serviço
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Service Categories Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(serviceCategories).map(([key, category]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-2xl">{category.icon}</span>
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Serviços disponíveis:
                    </p>
                    <div className="space-y-2">
                      {category.subServices.map((service) => (
                        <Badge key={service.id} variant="secondary" className="mr-2 mb-2">
                          {service.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Maria Silva</p>
                      <p className="text-sm text-gray-500">Fisioterapia • Hoje às 14:00 • 2h</p>
                      <p className="text-sm text-gray-600">R$ 160,00</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Contatar</Button>
                      <Button size="sm">Iniciar</Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">João Santos</p>
                      <p className="text-sm text-gray-500">Acompanhamento Hospitalar • Amanhã às 09:00 • 4h</p>
                      <p className="text-sm text-gray-600">R$ 320,00</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Contatar</Button>
                      <Button size="sm" variant="secondary">Agendado</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <Heart className="h-10 w-10 text-gray-600" />
                    </div>
                    <div>
                      <Button variant="outline">Alterar Foto</Button>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG até 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome Completo</label>
                      <Input defaultValue="Dr. João Silva" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">E-mail</label>
                      <Input defaultValue="joao@email.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone</label>
                      <Input defaultValue="(11) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CRM/Registro</label>
                      <Input placeholder="Número do registro profissional" />
                    </div>
                  </div>

                  <Button>Salvar Alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}