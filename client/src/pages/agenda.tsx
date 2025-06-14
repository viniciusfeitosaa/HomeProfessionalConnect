import { StatusBar } from "@/components/status-bar";
import { Calendar, Clock, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useQuery } from "@tanstack/react-query";
import type { Appointment } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Agenda() {
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const handleContactProfessional = (professionalName: string) => {
    console.log("Contacting professional:", professionalName);
  };

  const handleReschedule = (appointmentId: number) => {
    console.log("Rescheduling appointment:", appointmentId);
  };

  const handleCancel = (appointmentId: number) => {
    console.log("Canceling appointment:", appointmentId);
  };

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        <StatusBar />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => new Date(apt.scheduledFor) > new Date());
  const pastAppointments = appointments.filter(apt => new Date(apt.scheduledFor) <= new Date());

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative">
      <StatusBar />
      
      <div className="px-4 py-6">
        <div className="flex items-center mb-6">
          <Calendar className="h-6 w-6 text-primary mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Minha Agenda</h1>
        </div>

        {/* Próximos Agendamentos */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Próximos Agendamentos
          </h2>
          
          {upcomingAppointments.length === 0 ? (
            <Card className="border border-gray-100">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">Nenhum agendamento próximo</p>
                <p className="text-sm text-gray-400">
                  Encontre um profissional e agende seu serviço
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {appointment.professionalName}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          Confirmado
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(appointment.scheduledFor), "dd/MM", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(appointment.scheduledFor), "EEEE", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(appointment.scheduledFor), "HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {appointment.description}
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactProfessional(appointment.professionalName)}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Contatar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReschedule(appointment.id)}
                        className="flex-1"
                      >
                        Reagendar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(appointment.id)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Histórico */}
        {pastAppointments.length > 0 && (
          <div className="mb-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Histórico
            </h2>
            
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="border border-gray-100 opacity-75">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-700">
                          {appointment.professionalName}
                        </h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Concluído
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {format(new Date(appointment.scheduledFor), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3">
                      {appointment.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Avaliar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-primary"
                      >
                        Agendar Novamente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}