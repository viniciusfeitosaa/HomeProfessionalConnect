import { useEffect, useState } from "react";
import { ProviderLayout } from "@/components/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, User, CheckCircle, XCircle, Activity, AlertCircle, ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/lib/api-config";
import { BottomNavigationProvider } from "@/components/bottom-navigation-provider";

interface Appointment {
  id: number;
  clientName: string;
  clientAvatar?: string;
  date: string;
  time: string;
  duration: number;
  type: "presencial" | "online";
  status: "agendado" | "confirmado" | "em_andamento" | "concluido" | "cancelado";
  location?: string;
  notes?: string;
  price: number;
  canConfirm: boolean;
  canStart: boolean;
  canFinish: boolean;
  canCancel: boolean;
}

export default function AgendaProfissional() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (user?.userType === "provider") {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/appointments/provider`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (e) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredAppointments = filterStatus === "all"
    ? appointments
    : appointments.filter(a => a.status === filterStatus);

  return (
    <ProviderLayout>
      <div className="max-w-3xl mx-auto py-6 px-2">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Agenda do Profissional</h1>
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant={filterStatus === "all" ? "default" : "outline"} onClick={() => setFilterStatus("all")}>Todos</Button>
          <Button variant={filterStatus === "agendado" ? "default" : "outline"} onClick={() => setFilterStatus("agendado")}>Agendados</Button>
          <Button variant={filterStatus === "confirmado" ? "default" : "outline"} onClick={() => setFilterStatus("confirmado")}>Confirmados</Button>
          <Button variant={filterStatus === "em_andamento" ? "default" : "outline"} onClick={() => setFilterStatus("em_andamento")}>Em andamento</Button>
          <Button variant={filterStatus === "concluido" ? "default" : "outline"} onClick={() => setFilterStatus("concluido")}>Concluídos</Button>
          <Button variant={filterStatus === "cancelado" ? "default" : "outline"} onClick={() => setFilterStatus("cancelado")}>Cancelados</Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando agendamentos...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum agendamento encontrado.</div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(appointment => (
              <Card key={appointment.id}>
                <CardHeader className="flex flex-row items-center gap-3">
                  <User className="h-6 w-6 text-gray-400" />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{appointment.clientName}</CardTitle>
                    <div className="text-sm text-gray-500">{format(new Date(appointment.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {appointment.time}</div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1">{getStatusText(appointment.status)}</span>
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Tipo: <span className="font-medium">{appointment.type === "presencial" ? "Presencial" : "Online"}</span>
                      </div>
                      {appointment.location && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          Local: <span className="font-medium">{appointment.location}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Duração: <span className="font-medium">{appointment.duration} min</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Valor: <span className="font-medium">R$ {appointment.price}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      {appointment.canConfirm && (
                        <Button size="sm" onClick={() => toast({ title: "Agendamento confirmado!" })}>Confirmar</Button>
                      )}
                      {appointment.canStart && (
                        <Button size="sm" onClick={() => toast({ title: "Atendimento iniciado!" })}>Iniciar</Button>
                      )}
                      {appointment.canFinish && (
                        <Button size="sm" onClick={() => toast({ title: "Atendimento concluído!" })}>Concluir</Button>
                      )}
                      {appointment.canCancel && (
                        <Button size="sm" variant="destructive" onClick={() => toast({ title: "Agendamento cancelado!" })}>Cancelar</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNavigationProvider />
    </ProviderLayout>
  );
} 