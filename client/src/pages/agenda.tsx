import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Star, ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ["/api/professionals"],
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Generate time slots for selected date
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

  const calendarDays = generateCalendarDays();
  const timeSlots = generateTimeSlots();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasAppointment = (date: Date) => {
    return appointments.some((apt: any) => {
      const aptDate = new Date(apt.scheduledFor);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt: any) => {
      const aptDate = new Date(apt.scheduledFor);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header userName="Gustavo" />
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex-1 lg:ml-64">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white dark:bg-gray-800 border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Agenda</h1>
            </div>
          </div>

          <div className="p-4 lg:p-6 pb-20 lg:pb-6">
            <Tabs defaultValue="calendar" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="calendar">Calendário</TabsTrigger>
                <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
                <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-6">
                {/* Calendar Navigation */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {daysOfWeek.map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(day)}
                          className={`
                            p-2 text-sm rounded-lg transition-colors relative
                            ${!isSameMonth(day) ? 'text-gray-300 dark:text-gray-600' : ''}
                            ${isToday(day) ? 'bg-primary text-white' : ''}
                            ${isSelected(day) && !isToday(day) ? 'bg-primary/10 text-primary' : ''}
                            ${!isSelected(day) && !isToday(day) ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                          `}
                        >
                          {day.getDate()}
                          {hasAppointment(day) && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Date Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Agendamentos para {selectedDate.toLocaleDateString('pt-BR')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getAppointmentsForDate(selectedDate).length > 0 ? (
                      <div className="space-y-4">
                        {getAppointmentsForDate(selectedDate).map((appointment: any) => (
                          <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{appointment.professionalName}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.serviceType}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(appointment.scheduledFor).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                <span>R$ {appointment.totalCost}</span>
                              </div>
                            </div>
                            <Badge variant={appointment.status === 'confirmed' ? 'secondary' : 'outline'}>
                              {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Nenhum agendamento para esta data</p>
                        <Link href="/">
                          <Button className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Agendar Consulta
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Todos os Agendamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {appointments.map((appointment: any) => (
                        <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{appointment.professionalName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.serviceType}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(appointment.scheduledFor).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(appointment.scheduledFor).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {appointment.address}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={appointment.status === 'confirmed' ? 'secondary' : 'outline'}>
                              {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                            </Badge>
                            <p className="text-sm font-semibold mt-1">R$ {appointment.totalCost}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Horários Disponíveis - {selectedDate.toLocaleDateString('pt-BR')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
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

                    {selectedTimeSlot && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold mb-2">Profissionais disponíveis às {selectedTimeSlot}</h4>
                        <div className="space-y-2">
                          {professionals.slice(0, 3).map((professional: any) => (
                            <div key={professional.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <img
                                  src={professional.imageUrl}
                                  alt={professional.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <p className="font-medium">{professional.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{professional.specialization}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">R$ {professional.hourlyRate}/h</p>
                                <Link href={`/professional/${professional.id}`}>
                                  <Button size="sm" className="mt-1">
                                    Agendar
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}