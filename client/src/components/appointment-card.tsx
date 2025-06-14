import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Star, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, Professional } from "@shared/schema";

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const [, setLocation] = useLocation();
  
  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ["/api/professionals"],
  });

  const professional = professionals.find(p => p.id === appointment.professionalId);

  const handleViewDetails = () => {
    setLocation("/agenda");
  };

  const handleViewProfessional = () => {
    if (professional) {
      setLocation(`/professional/${professional.id}`);
    }
  };

  const handleContact = () => {
    console.log("Contacting professional:", appointment.professionalName);
  };

  return (
    <div className="px-4 mb-6">
      <div className="bg-gradient-to-br from-primary via-purple-600 to-secondary rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <h3 className="text-xl font-bold mr-3">{appointment.professionalName}</h3>
                <Badge className="bg-white/25 backdrop-blur-sm text-white border-0 text-xs px-3 py-1 rounded-full">
                  ✓ Confirmado
                </Badge>
              </div>
              
              <p className="text-sm opacity-95 mb-4 leading-relaxed">
                {appointment.description}
              </p>
              
              <div className="mb-5">
                <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 mb-3">
                  <Clock className="h-4 w-4 mr-2 text-white/90" />
                  <span className="text-sm font-medium">
                    {format(new Date(appointment.scheduledFor), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                {professional && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <Star className="h-3 w-3 mr-1.5 text-yellow-300" />
                      <span className="text-sm font-medium">{professional.rating}</span>
                    </div>
                    <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <MapPin className="h-3 w-3 mr-1.5 text-white/90" />
                      <span className="text-sm font-medium">{professional.distance} km</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={handleViewDetails}
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0 flex-1 rounded-xl py-2.5 font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  Ver detalhes
                </Button>
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={handleContact}
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0 rounded-xl px-4 transition-all duration-200 hover:scale-[1.02]"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="ml-6">
              <div 
                className="cursor-pointer group"
                onClick={handleViewProfessional}
              >
                <div className="relative">
                  <img
                    src={professional?.imageUrl || "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                    alt={`${appointment.professionalName} - Profissional`}
                    className="w-24 h-24 rounded-2xl object-cover border-3 border-white/40 shadow-2xl group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
