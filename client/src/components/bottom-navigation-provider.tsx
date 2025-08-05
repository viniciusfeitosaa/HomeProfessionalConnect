import { Home, Calendar, MessageCircle, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function BottomNavigationProvider() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/provider-dashboard" && location === "/provider-dashboard") return true;
    if (path === "/agenda-profissional" && location === "/agenda-profissional") return true;
    if (path !== "/provider-dashboard" && path !== "/agenda-profissional" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[95vw] max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200/70 dark:border-gray-800/70 shadow-xl rounded-2xl z-50 flex justify-center items-center">
      <div className="flex justify-around w-full py-2 sm:py-3">
        <Link href="/provider-dashboard">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/provider-dashboard")
                ? "text-primary hover:text-primary/80"
                : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className={`text-xs ${isActive("/provider-dashboard") ? "font-medium" : ""}`}>
              Início
            </span>
          </Button>
        </Link>

        <Link href="/agenda-profissional">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/agenda-profissional")
                ? "text-primary hover:text-primary/80"
                : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
            }`}
          >
            <Calendar className="h-5 w-5 mb-1" />
            <span className={`text-xs ${isActive("/agenda-profissional") ? "font-medium" : ""}`}>
              Agenda
            </span>
          </Button>
        </Link>
        <Link href="/messages">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/messages")
                ? "text-primary hover:text-primary/80"
                : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
            }`}
          >
            <MessageCircle className="h-5 w-5 mb-1" />
            <span className={`text-xs ${isActive("/messages") ? "font-medium" : ""}`}>
              Chat
            </span>
          </Button>
        </Link>

        <Link href="/provider-orders">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/provider-orders")
                ? "text-primary hover:text-primary/80"
                : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
            }`}
          >
            <ClipboardList className="h-5 w-5 mb-1" />
            <span className={`text-xs ${isActive("/provider-orders") ? "font-medium" : ""}`}>
              Pedidos
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
} 
