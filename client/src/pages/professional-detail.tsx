import { ArrowLeft, Star, MapPin, Clock, Phone, MessageCircle, Calendar, Heart, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Professional } from "@shared/schema";

interface ProfessionalDetailProps {
  professionalId: string;
}

export default function ProfessionalDetail({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const professionalId = parseInt(params.id);

  const { data: professional, isLoading } = useQuery<Professional>({
    queryKey: ["/api/professionals", professionalId],
  });

  const handleBack = () => {
    setLocation("/");
  };

  const handleSchedule = () => {
    console.log("Scheduling appointment with", professional?.name);
  };

  const handleCall = () => {
    console.log("Calling", professional?.name);
  };

  const handleMessage = () => {
    setLocation("/messages");
  };

  const handleFavorite = () => {
    console.log("Adding to favorites", professional?.name);
  };

  const handleShare = () => {
    console.log("Sharing profile", professional?.name);
  };

  if (isLoading || !professional) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Mock additional data for demo
  const reviews = [
    {
      id: 1,
      userName: "Ana Silva",
      rating: 5,
      comment: "Excelente profissional! Muito pontual e trabalho de qualidade.",
      date: "2025-06-10"
    },
    {
      id: 2,
      userName: "João Santos",
      rating: 5,
      comment: "Recomendo! Resolveu o problema rapidamente e preço justo.",
      date: "2025-06-08"
    },
    {
      id: 3,
      userName: "Maria Costa",
      rating: 4,
      comment: "Bom atendimento, chegou no horário combinado.",
      date: "2025-06-05"
    }
  ];

  const services = [
    "Reparo de vazamentos",
    "Instalação de torneiras",
    "Desentupimento",
    "Troca de registros",
    "Manutenção preventiva"
  ];

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-primary to-secondary"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="absolute top-4 left-4 bg-white/20 text-white hover:bg-white/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            className="bg-white/20 text-white hover:bg-white/30"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="bg-white/20 text-white hover:bg-white/30"
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Profile Card */}
        <div className="absolute -bottom-16 left-4 right-4">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-20 h-20 border-4 border-white">
                  <AvatarImage src={professional.imageUrl} />
                  <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {professional.name}
                  </h1>
                  <p className="text-gray-600 mb-2">{professional.service}</p>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{professional.rating}</span>
                      <span className="text-gray-500 text-sm ml-1">(127)</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{professional.distance} km</span>
                    </div>
                  </div>
                  <Badge 
                    className={`
                      ${professional.available
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full mr-1 ${
                        professional.available ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    {professional.available ? "Disponível agora" : "Ocupado"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-20 px-4 pb-24">
        {/* Action Buttons */}
        <div className="flex space-x-3 mb-6">
          <Button onClick={handleCall} className="flex-1">
            <Phone className="h-4 w-4 mr-2" />
            Ligar
          </Button>
          <Button onClick={handleMessage} variant="outline" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Mensagem
          </Button>
          <Button onClick={handleSchedule} className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar
          </Button>
        </div>

        {/* About */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-3">Sobre</h2>
            <p className="text-gray-600 mb-4">
              Profissional com mais de 8 anos de experiência em serviços hidráulicos. 
              Especializado em reparos residenciais e comerciais, sempre com materiais 
              de qualidade e garantia no serviço.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Resp. em 15 min</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                <span>100% recomendado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-3">Serviços</h2>
            <div className="space-y-2">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-gray-700">{service}</span>
                  <span className="text-sm text-gray-500">A partir de R$ 50</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Avaliações</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todas
              </Button>
            </div>
            
            <div className="space-y-4">
              {reviews.slice(0, 2).map((review) => (
                <div key={review.id}>
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {review.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{review.userName}</span>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                  {review.id !== reviews[1].id && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}