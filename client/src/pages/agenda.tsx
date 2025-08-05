import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Video, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Navigation,
  User,
  Activity,
  Calendar,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProviderLayout } from "@/components/ProviderLayout";
import { BottomNavigation } from "@/components/bottom-navigation";
import ClientNavbar from "../components/client-navbar";


interface Appointment {
  id: number;
  professionalId: number;
  professionalName: string;
  professionalAvatar: string;
  specialization: string;
  date: Date;
  time: string;
  duration: number; // em minutos
  type: "presencial" | "online";
  status: "agendado" | "confirmado" | "em_andamento" | "concluido" | "cancelado";
  location?: string;
  notes?: string;
  price: number;
  rating?: number;
  canReschedule: boolean;
  canCancel: boolean;
  meetingLink?: string;
  professionalPhone?: string;
}

export default function Agenda() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dados de agendamentos serão carregados da API
  // TODO: Implementar busca de agendamentos reais

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "confirmado": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "em_andamento": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "concluido": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "cancelado": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmado": return <CheckCircle className="h-3 w-3" />;
      case "cancelado": return <XCircle className="h-3 w-3" />;
      case "em_andamento": return <Activity className="h-3 w-3" />;
      case "concluido": return <CheckCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "agendado": return "Agendado";
      case "confirmado": return "Confirmado";
      case "em_andamento": return "Em Andamento";
      case "concluido": return "Concluído";
      case "cancelado": return "Cancelado";
      default: return status;
    }
  };

  const filteredAppointments = [] as Appointment[]; // Placeholder, will be fetched from API

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(apt => isSameDay(apt.date, date));
  };

  const getDaysInMonth = () => {
    const start = startOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subWeeks(currentDate, 4));
  };

  const handleNextMonth = () => {
    setCurrentDate(addWeeks(currentDate, 4));
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleCancelAppointment = () => {
    toast({
      title: "Agendamento cancelado",
      description: "Seu agendamento foi cancelado com sucesso.",
    });
    setShowAppointmentDetails(false);
  };

  const handleRescheduleAppointment = () => {
    toast({
      title: "Reagendamento",
      description: "Redirecionando para reagendar consulta...",
    });
    setShowAppointmentDetails(false);
  };

  const startVideoCall = () => {
    if (selectedAppointment?.meetingLink) {
      window.open(selectedAppointment.meetingLink, '_blank');
      toast({
        title: "Videochamada iniciada",
        description: "Abrindo link da reunião...",
      });
    }
  };

  const makePhoneCall = () => {
    if (selectedAppointment?.professionalPhone) {
      window.open(`tel:${selectedAppointment.professionalPhone}`);
    }
  };

  const openDirections = () => {
    if (selectedAppointment?.location) {
      const encodedLocation = encodeURIComponent(selectedAppointment.location);
      window.open(`https://maps.google.com/?q=${encodedLocation}`, '_blank');
    }
  };

  const handleNavigation = (label: string) => {
    switch (label) {
      case "Home":
        window.location.href = "/";
        break;
      case "Chat":
        window.location.href = "/messages";
        break;
      case "Agenda":
        window.location.href = "/agenda";
        break;
      case "Perfil":
        window.location.href = "/profile";
        break;
      default:
        window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Minha Agenda</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda</h1>
              <p className="text-gray-600 dark:text-gray-300">Gerencie seus agendamentos</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600">
                <Plus className="h-4 w-4 mr-2" />
                Nova Consulta
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className={filterStatus === "all" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === "agendado" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("agendado")}
              className={filterStatus === "agendado" ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              Agendados
            </Button>
            <Button
              variant={filterStatus === "confirmado" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("confirmado")}
              className={filterStatus === "confirmado" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              Confirmados
            </Button>
            <Button
              variant={filterStatus === "concluido" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("concluido")}
              className={filterStatus === "concluido" ? "bg-gray-500 hover:bg-gray-600" : ""}
            >
              Concluídos
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg">
                    {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth().map((date, index) => {
                      const dayAppointments = getAppointmentsForDate(date);
                      const isCurrentMonth = isSameMonth(date, currentDate);
                      const isToday = isSameDay(date, new Date());
                      const isSelected = isSameDay(date, selectedDate);
                      
                      return (
                        <div
                          key={index}
                          className={`
                            min-h-[80px] p-1 border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors
                            ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                            ${isToday ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' : ''}
                            ${isSelected ? 'ring-2 ring-yellow-500' : ''}
                            hover:bg-gray-50 dark:hover:bg-gray-700
                          `}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className={`
                            text-sm font-medium mb-1
                            ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}
                            ${isToday ? 'text-yellow-600 dark:text-yellow-400' : ''}
                          `}>
                            {format(date, 'd')}
                          </div>
                          
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map(apt => (
                              <div
                                key={apt.id}
                                className={`
                                  text-xs p-1 rounded cursor-pointer truncate
                                  ${getStatusColor(apt.status)}
                                `}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAppointmentClick(apt);
                                }}
                              >
                                {apt.time} - {apt.professionalName}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                                +{dayAppointments.length - 2} mais
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointments List */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Agendamentos - {format(selectedDate, "dd/MM/yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getAppointmentsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">
                        Nenhum agendamento para este dia
                      </p>
                    </div>
                  ) : (
                    getAppointmentsForDate(selectedDate).map(appointment => (
                      <div
                        key={appointment.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={appointment.professionalAvatar} alt={appointment.professionalName} />
                            <AvatarFallback>{appointment.professionalName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                {appointment.professionalName}
                              </h4>
                              <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1">{getStatusText(appointment.status)}</span>
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              {appointment.specialization}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {appointment.time} ({appointment.duration}min)
                              </div>
                              {appointment.type === "presencial" ? (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  Presencial
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Video className="h-3 w-3" />
                                  Online
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                R$ {appointment.price}
                              </span>
                              {appointment.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {appointment.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Appointment Details Modal */}
          <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedAppointment?.professionalAvatar} alt={selectedAppointment?.professionalName} />
                    <AvatarFallback>{selectedAppointment?.professionalName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedAppointment?.professionalName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedAppointment?.specialization}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              {selectedAppointment && (
                <div className="space-y-6">
                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(selectedAppointment.status)}`}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span className="ml-1">{getStatusText(selectedAppointment.status)}</span>
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      {selectedAppointment.type === "online" && selectedAppointment.meetingLink && (
                        <Button size="sm" onClick={startVideoCall} className="bg-blue-500 hover:bg-blue-600">
                          <Video className="h-4 w-4 mr-2" />
                          Entrar na Reunião
                        </Button>
                      )}
                      {selectedAppointment.professionalPhone && (
                        <Button variant="outline" size="sm" onClick={makePhoneCall}>
                          <Phone className="h-4 w-4 mr-2" />
                          Ligar
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Mensagem
                      </Button>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data e Horário</h4>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <CalendarIcon className="h-4 w-4" />
                          {format(selectedAppointment.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
                          <Clock className="h-4 w-4" />
                          {selectedAppointment.time} - {selectedAppointment.duration} minutos
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tipo de Consulta</h4>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          {selectedAppointment.type === "presencial" ? (
                            <>
                              <MapPin className="h-4 w-4" />
                              Presencial
                            </>
                          ) : (
                            <>
                              <Video className="h-4 w-4" />
                              Online
                            </>
                          )}
                        </div>
                      </div>

                      {selectedAppointment.location && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Local</h4>
                          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <div>
                              <p>{selectedAppointment.location}</p>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-yellow-600 hover:text-yellow-700"
                                onClick={openDirections}
                              >
                                <Navigation className="h-3 w-3 mr-1" />
                                Ver no mapa
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Valor</h4>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          R$ {selectedAppointment.price}
                        </p>
                      </div>

                      {selectedAppointment.rating && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Avaliação</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-semibold">{selectedAppointment.rating}</span>
                            </div>
                            <span className="text-gray-600 dark:text-gray-300">Excelente profissional</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contato</h4>
                        {selectedAppointment.professionalPhone && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Phone className="h-4 w-4" />
                            {selectedAppointment.professionalPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedAppointment.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Observações</h4>
                      <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedAppointment.status !== "concluido" && selectedAppointment.status !== "cancelado" && (
                    <div className="flex gap-3 pt-4 border-t">
                      {selectedAppointment.canReschedule && (
                        <Button
                          variant="outline"
                          onClick={() => handleRescheduleAppointment()}
                        >
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Reagendar
                        </Button>
                      )}
                      {selectedAppointment.canCancel && (
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => handleCancelAppointment()}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
      </div>
      <ClientNavbar />
    </div>
  );
}