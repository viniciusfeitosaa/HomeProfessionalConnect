import { Button } from "@/components/ui/button";
import type { Appointment } from "@shared/schema";

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const handleViewDetails = () => {
    console.log("Viewing appointment details:", appointment.id);
  };

  return (
    <div className="px-4 mb-6">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-4 text-white relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm opacity-90 mb-3">
              {appointment.description}
            </p>
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleViewDetails}
              className="bg-white/20 text-white hover:bg-white/30 border-0"
            >
              Ver detalhes
            </Button>
          </div>
          <div className="ml-4">
            <img
              src="https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
              alt="Profissional com uniforme de trabalho"
              className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
