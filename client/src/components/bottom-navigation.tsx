import { Home, Calendar, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BottomNavigation() {
  const handleNavigation = (section: string) => {
    console.log("Navigating to:", section);
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation("home")}
          className="flex flex-col items-center py-2 px-4 text-primary hover:text-primary/80"
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Início</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation("schedule")}
          className="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-primary"
        >
          <Calendar className="h-5 w-5 mb-1" />
          <span className="text-xs">Agenda</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation("messages")}
          className="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-primary"
        >
          <MessageCircle className="h-5 w-5 mb-1" />
          <span className="text-xs">Mensagens</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation("profile")}
          className="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-primary"
        >
          <User className="h-5 w-5 mb-1" />
          <span className="text-xs">Perfil</span>
        </Button>
      </div>
    </div>
  );
}
