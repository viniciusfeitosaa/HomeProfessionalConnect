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
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-5 text-white relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold mr-2">{appointment.professionalName}</h3>
              <Badge className="bg-white/20 text-white border-0 text-xs">
                Confirmado
              </Badge>
            </div>
            <p className="text-sm opacity-90 mb-3">
              {appointment.description}
            </p>
            
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 opacity-80" />
                <span className="text-sm">
                  {format(new Date(appointment.scheduledFor), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              {professional && (
                <>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 opacity-80" />
                    <span className="text-sm">{professional.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 opacity-80" />
                    <span className="text-sm">{professional.distance} km</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleViewDetails}
                className="bg-white/20 text-white hover:bg-white/30 border-0 flex-1"
              >
                Ver detalhes
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleContact}
                className="bg-white/20 text-white hover:bg-white/30 border-0"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="ml-4">
            <div 
              className="cursor-pointer"
              onClick={handleViewProfessional}
            >
              <img
                src={professional?.imageUrl || "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                alt={`${appointment.professionalName} - Profissional`}
                className="w-20 h-20 rounded-full object-cover border-3 border-white/30 shadow-lg hover:scale-105 transition-transform"
              />
              {professional?.available && (
                <div className="absolute -mt-2 -mr-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
