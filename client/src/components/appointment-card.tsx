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
    <div className="px-4 sm:px-6 lg:px-8 mb-6">
      <div className="bg-gradient-to-br from-primary via-purple-600 to-secondary rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 mb-4 lg:mb-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="cursor-pointer group"
                    onClick={handleViewProfessional}
                  >
                    <div className="relative">
                      <img
                        src={professional?.imageUrl || "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                        alt={`${appointment.professionalName} - Profissional`}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white/40 shadow-lg group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-full transition-all duration-300"></div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{appointment.professionalName}</h3>
                </div>
                <Badge className="bg-white/25 backdrop-blur-sm text-white border-0 text-xs px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Confirmado
                </Badge>
              </div>
              
              <p className="text-sm opacity-95 mb-4 leading-relaxed">
                {appointment.notes || "Agendamento confirmado"}
              </p>
              
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 w-full sm:w-auto">
                    <Clock className="h-4 w-4 mr-2 text-white/90 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      {format(new Date(appointment.scheduledFor), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={handleViewDetails}
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0 rounded-lg py-2 px-3 text-xs font-medium transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto"
                  >
                    Ver detalhes
                  </Button>
                </div>
                {professional && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <Star className="h-3 w-3 mr-1.5 text-yellow-300" />
                        <span className="text-sm font-medium">{professional.rating}</span>
                      </div>
                      <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <MapPin className="h-3 w-3 mr-1.5 text-white/90" />
                        <span className="text-sm font-medium">{professional.distance} km</span>
                      </div>
                    </div>
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={handleContact}
                      className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0 rounded-lg py-1.5 px-3 transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      <span className="text-xs">Contato</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
