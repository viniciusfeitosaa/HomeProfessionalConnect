import { Home, Calendar, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function BottomNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm lg:max-w-4xl xl:max-w-6xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50 shadow-2xl lg:hidden">
      <div className="flex justify-around py-2 sm:py-3">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/") 
                ? "text-primary hover:text-primary/80" 
                : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className={`text-xs ${isActive("/") ? "font-medium" : ""}`}>
              Início
            </span>
          </Button>
        </Link>
        
        <Link href="/agenda">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/agenda") 
                ? "text-primary hover:text-primary/80" 
                : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
            }`}
          >
            <Calendar className="h-5 w-5 mb-1" />
            <span className={`text-xs ${isActive("/agenda") ? "font-medium" : ""}`}>
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
              Mensagens
            </span>
          </Button>
        </Link>
        
        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/profile") 
                ? "text-primary hover:text-primary/80" 
                : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
            }`}
          >
            <User className="h-5 w-5 mb-1" />
            <span className={`text-xs ${isActive("/profile") ? "font-medium" : ""}`}>
              Perfil
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
