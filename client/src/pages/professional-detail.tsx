import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Star, MapPin, Clock, Calendar, Phone, Mail, Award, Heart, 
  ArrowLeft, MessageCircle, Video, Share2, BookOpen, Camera,
  CheckCircle, Users, Target, TrendingUp 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface ProfessionalDetailProps {
  params: { id: string };
}

export default function ProfessionalDetail({ params }: { params: { id: string } }) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [message, setMessage] = useState("");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const { data: professional } = useQuery({
    queryKey: [`/api/professionals/${params.id}`],
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ["/api/professionals"],
  });

  // Find professional from the list if API doesn't work
  const currentProfessional = professional || professionals.find((p: any) => p.id === parseInt(params.id));

  if (!currentProfessional) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Profissional não encontrado</h2>
          <Link href="/">
            <Button>Voltar para Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryIcons = {
    fisioterapeuta: "🏃‍♂️",
    acompanhante_hospitalar: "🏥", 
    tecnico_enfermagem: "💉"
  };

  const categoryNames = {
    fisioterapeuta: "Fisioterapeuta",
    acompanhante_hospitalar: "Acompanhante Hospitalar",
    tecnico_enfermagem: "Técnico em Enfermagem"
  };

  const categoryIcon = categoryIcons[currentProfessional.category] || "👨‍⚕️";
  const categoryName = categoryNames[currentProfessional.category] || currentProfessional.category;

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message via API
      console.log("Sending message:", message);
      setMessage("");
      setIsMessageDialogOpen(false);
      // Show success toast or redirect to messages
    }
  };

  // Portfolio items (mock data for demonstration)
  const portfolioItems = [
    {
      id: 1,
      title: "Reabilitação Respiratória Pós-COVID",
      description: "Programa especializado para recuperação pulmonar",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      category: "Fisioterapia Respiratória"
    },
    {
      id: 2,
      title: "Reabilitação Neurológica",
      description: "Tratamento para pacientes com AVC e lesões medulares",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      category: "Neurologia"
    },
    {
      id: 3,
      title: "Fisioterapia Domiciliar",
      description: "Atendimento personalizado no conforto do lar",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      category: "Domiciliar"
    }
  ];

  // Reviews (mock data)
  const reviews = [
    {
      id: 1,
      patient: "Maria S.",
      rating: 5,
      comment: "Excelente profissional! Muito atenciosa e competente. A fisioterapia respiratória me ajudou muito na recuperação pós-COVID.",
      date: "2025-06-10",
      service: "Fisioterapia Respiratória"
    },
    {
      id: 2,
      patient: "João P.",
      rating: 5,
      comment: "Tratamento excepcional para minha reabilitação neurológica. Profissional muito dedicada e experiente.",
      date: "2025-06-08",
      service: "Reabilitação Neurológica"
    },
    {
      id: 3,
      patient: "Ana L.",
      rating: 4,
      comment: "Ótimo atendimento domiciliar. Pontual e muito profissional. Recomendo!",
      date: "2025-06-05",
      service: "Fisioterapia Domiciliar"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Perfil do Profissional</h1>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-20 space-y-6">
        {/* Professional Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={currentProfessional.imageUrl}
                  alt={currentProfessional.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mx-auto sm:mx-0"
                />
              </div>

              {/* Professional Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {currentProfessional.name}
                    </h1>
                    <p className="text-lg text-primary font-semibold flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <span>{categoryIcon}</span>
                      {categoryName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {currentProfessional.specialization}
                    </p>
                  </div>
                  <Badge 
                    variant={currentProfessional.available ? "secondary" : "outline"}
                    className={`${
                      currentProfessional.available 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {currentProfessional.available ? "Disponível" : "Ocupado"}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{currentProfessional.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">Avaliação</p>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold mb-1">{currentProfessional.totalReviews}</div>
                    <p className="text-xs text-gray-500">Avaliações</p>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold mb-1">{currentProfessional.experience}</div>
                    <p className="text-xs text-gray-500">Experiência</p>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold mb-1 text-primary">R$ {currentProfessional.hourlyRate}/h</div>
                    <p className="text-xs text-gray-500">Valor</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-400 mb-6">
                  <MapPin className="h-4 w-4" />
                  <span>{currentProfessional.location}</span>
                  <span>•</span>
                  <span>{currentProfessional.distance} km de você</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Consulta
                  </Button>
                  <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enviar mensagem para {currentProfessional.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Digite sua mensagem sobre o serviço que você precisa..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleSendMessage} disabled={!message.trim()}>
                            Enviar Mensagem
                          </Button>
                          <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Videochamada
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            <TabsTrigger value="schedule">Agendar</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Sobre o Profissional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {currentProfessional.description}
                </p>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificações e Qualificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentProfessional.certifications?.split(',').map((cert: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>{cert.trim()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{currentProfessional.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Atendimento de segunda a sábado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Portfólio de Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <Badge variant="outline" className="mb-2">
                          {item.category}
                        </Badge>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Avaliações dos Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-sm">{review.patient[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{review.patient}</p>
                            <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {review.service}
                      </Badge>
                      <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Agendar Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <h3 className="font-semibold mb-3">Selecione a data</h3>
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="w-full p-3 border rounded-lg"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <h3 className="font-semibold mb-3">Horários disponíveis</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTimeSlot === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimeSlot(time)}
                          className="text-xs"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Booking Summary */}
                  {selectedTimeSlot && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold mb-2">Resumo do Agendamento</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Profissional:</strong> {currentProfessional.name}</p>
                        <p><strong>Serviço:</strong> {currentProfessional.specialization}</p>
                        <p><strong>Data:</strong> {selectedDate.toLocaleDateString('pt-BR')}</p>
                        <p><strong>Horário:</strong> {selectedTimeSlot}</p>
                        <p><strong>Valor:</strong> R$ {currentProfessional.hourlyRate}/hora</p>
                      </div>
                      <Link href="/payment">
                        <Button className="w-full mt-4">
                          Confirmar Agendamento
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}