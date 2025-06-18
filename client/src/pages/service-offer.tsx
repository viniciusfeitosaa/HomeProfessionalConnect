import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, MessageCircle, DollarSign, Clock, MapPin, 
  Star, Send, Phone, Video, CheckCircle, AlertCircle 
} from "lucide-react";
import { Link, useParams } from "wouter";

export default function ServiceOffer() {
  const params = useParams();
  const serviceId = params.id;
  
  const [offerMessage, setOfferMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [isOfferSent, setIsOfferSent] = useState(false);

  // Mock service data - in real app would come from API
  const serviceRequest = {
    id: 1,
    clientName: "Maria Silva",
    clientAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    serviceType: "Fisioterapia Respiratória",
    location: "Vila Madalena, SP",
    distance: 1.2,
    urgency: "high",
    budget: 120,
    description: "Preciso de fisioterapia respiratória pós-COVID. Tenho dificuldades para respirar e gostaria de um acompanhamento especializado. Prefiro atendimento domiciliar.",
    timePosted: "15 min atrás",
    responses: 3,
    preferredTime: "Manhã (08:00 - 12:00)",
    clientRating: 4.9,
    previousServices: 12,
    additionalDetails: "Paciente tem 65 anos, já teve COVID há 3 meses. Médico recomendou fisioterapia respiratória. Tem equipamentos básicos em casa.",
    address: "Rua Augusta, 1234 - Vila Madalena"
  };

  const handleSendOffer = () => {
    if (offerMessage.trim() && proposedPrice && estimatedTime) {
      // Simular envio da oferta
      console.log("Oferta enviada:", {
        serviceId,
        message: offerMessage,
        price: proposedPrice,
        time: estimatedTime
      });
      setIsOfferSent(true);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/provider-dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhes do Serviço</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {isOfferSent ? (
          /* Success State */
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                Oferta Enviada com Sucesso!
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Sua proposta foi enviada para {serviceRequest.clientName}. 
                Você receberá uma notificação quando ela responder.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/provider-dashboard">
                  <Button variant="outline">
                    Voltar ao Dashboard
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mensagem para {serviceRequest.clientName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Digite uma mensagem adicional..."
                        rows={4}
                      />
                      <Button className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Service Request Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={serviceRequest.clientAvatar}
                      alt={serviceRequest.clientName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-bold">{serviceRequest.clientName}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{serviceRequest.clientRating}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{serviceRequest.previousServices} serviços</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getUrgencyColor(serviceRequest.urgency)}>
                    {serviceRequest.urgency === 'high' ? 'Urgente' : 
                     serviceRequest.urgency === 'medium' ? 'Moderado' : 'Normal'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-primary mb-2">
                    {serviceRequest.serviceType}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {serviceRequest.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Orçamento</p>
                    <p className="font-semibold">R$ {serviceRequest.budget}</p>
                  </div>
                  <div className="text-center">
                    <MapPin className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Distância</p>
                    <p className="font-semibold">{serviceRequest.distance} km</p>
                  </div>
                  <div className="text-center">
                    <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Horário</p>
                    <p className="font-semibold">{serviceRequest.preferredTime}</p>
                  </div>
                  <div className="text-center">
                    <MessageCircle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Respostas</p>
                    <p className="font-semibold">{serviceRequest.responses}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Endereço</h4>
                    <p className="text-gray-600 dark:text-gray-300">{serviceRequest.address}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Detalhes Adicionais</h4>
                    <p className="text-gray-600 dark:text-gray-300">{serviceRequest.additionalDetails}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Make Offer Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Fazer Proposta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Valor Proposto (R$)</label>
                    <Input
                      type="number"
                      placeholder="120.00"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tempo Estimado</label>
                    <Input
                      placeholder="1 hora"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Mensagem da Proposta</label>
                  <Textarea
                    placeholder="Olá! Sou fisioterapeuta especializada em reabilitação respiratória pós-COVID. Tenho experiência com pacientes na sua faixa etária e posso levar equipamentos específicos para o atendimento domiciliar..."
                    rows={4}
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                  />
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Dicas para uma boa proposta:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Demonstre sua experiência específica no tipo de serviço</li>
                      <li>• Mencione equipamentos ou materiais que você possui</li>
                      <li>• Seja claro sobre disponibilidade e tempo de resposta</li>
                      <li>• Ofereça um valor competitivo mas justo</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSendOffer}
                    disabled={!offerMessage.trim() || !proposedPrice || !estimatedTime}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Proposta
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Mensagem
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Mensagem para {serviceRequest.clientName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Faça uma pergunta sobre o serviço..."
                          rows={4}
                        />
                        <Button className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Competition Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Outras Propostas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="font-medium">Profissional A</p>
                        <p className="text-sm text-gray-600">⭐ 4.7 • 23 serviços</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ 110</p>
                      <p className="text-xs text-gray-500">há 30 min</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="font-medium">Profissional B</p>
                        <p className="text-sm text-gray-600">⭐ 4.9 • 45 serviços</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ 130</p>
                      <p className="text-xs text-gray-500">há 1h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}