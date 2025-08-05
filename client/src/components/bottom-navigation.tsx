import { Home, Calendar, MessageCircle, User, Plus } from "lucide-react";
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[95vw] max-w-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/60 shadow-2xl rounded-2xl z-50">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center relative">
          {/* Botões laterais */}
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center h-12 w-12 p-0 rounded-xl transition-all duration-200 ${
                isActive("/") 
                  ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" 
                  : "text-gray-500 dark:text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Home className="h-5 w-5 mb-0.5" />
              <span className="text-xs font-medium">Início</span>
            </Button>
          </Link>
          
          <Link href="/agenda">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center h-12 w-12 p-0 rounded-xl transition-all duration-200 ${
                isActive("/agenda") 
                  ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" 
                  : "text-gray-500 dark:text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Calendar className="h-5 w-5 mb-0.5" />
              <span className="text-xs font-medium">Agenda</span>
            </Button>
          </Link>

          {/* Botão central para criar serviço */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-8">
            <Link href="/servico">
              <Button
                variant="default"
                size="icon"
                className={`rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl hover:shadow-2xl hover:from-yellow-600 hover:to-yellow-700 w-16 h-16 flex items-center justify-center transition-all duration-300 border-4 border-white dark:border-gray-900 focus:ring-4 focus:ring-yellow-200 dark:focus:ring-yellow-800 ${
                  isActive("/servico") ? "ring-4 ring-yellow-200 dark:ring-yellow-800" : ""
                }`}
                aria-label="Criar Serviço"
              >
                <Plus className="h-8 w-8" />
              </Button>
            </Link>
          </div>

          <Link href="/messages">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center h-12 w-12 p-0 rounded-xl transition-all duration-200 ${
                isActive("/messages") 
                  ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" 
                  : "text-gray-500 dark:text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <MessageCircle className="h-5 w-5 mb-0.5" />
              <span className="text-xs font-medium">Chat</span>
            </Button>
          </Link>

          <Link href="/profile">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center h-12 w-12 p-0 rounded-xl transition-all duration-200 ${
                isActive("/profile") 
                  ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" 
                  : "text-gray-500 dark:text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <User className="h-5 w-5 mb-0.5" />
              <span className="text-xs font-medium">Perfil</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
