import { Home, Calendar, MessageCircle, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

export function BottomNavigation() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: unreadData } = useUnreadMessages();
  const unreadCount = unreadData?.unreadCount || 0;

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
              <Home className="h-4 w-4 mb-0" />
              <span className="text-[10px] font-medium">Início</span>
            </Button>
          </Link>

          {/* Botão central para criar serviço com verificação de cadastro */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Button
              variant="default"
              size="icon"
              className={`rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl hover:shadow-2xl hover:from-yellow-600 hover:to-yellow-700 w-16 h-16 flex items-center justify-center transition-all duration-300 border-4 border-white dark:border-gray-900 focus:ring-4 focus:ring-yellow-200 dark:focus:ring-yellow-800 ${
                isActive("/servico") ? "ring-4 ring-yellow-200 dark:ring-yellow-800" : ""
              }`}
              aria-label="Criar Serviço"
              onClick={() => {
                // Validações do cadastro (email, telefone e CPF)
                const emailOk = !!(user?.email && /.+@.+\..+/.test(user.email.trim()));
                const phoneOk = (() => {
                  const digits = (user?.phone || "").replace(/\D/g, "");
                  return digits.length === 11 && digits[0] !== '0' && digits[1] !== '0' && digits[2] === '9';
                })();
                const isValidCPF = (cpfRaw: string) => {
                  const cpf = cpfRaw.replace(/\D/g, '');
                  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
                  const calc = (b: number) => {
                    let s = 0; for (let i = 0; i < b; i++) s += parseInt(cpf[i], 10) * (b + 1 - i);
                    const r = (s * 10) % 11; return r === 10 ? 0 : r;
                  };
                  return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10);
                };
                const cpfStored = (typeof window !== 'undefined' ? localStorage.getItem('client_cpf') : '') || '';
                const cpfOk = isValidCPF(cpfStored);
                const steps = [emailOk, phoneOk, cpfOk].filter(Boolean).length;
                const verified = steps === 3;

                if (!verified) {
                  toast({
                    title: "Verificação em andamento",
                    description: `Conclua seu cadastro (${steps}/3): Email, Telefone e CPF para criar um serviço.`,
                  });
                  setLocation('/profile');
                  return;
                }
                setLocation('/servico');
              }}
            >
              <Plus className="h-8 w-8" />
            </Button>
          </div>

          <Link href="/messages">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center h-12 w-12 p-0 rounded-xl transition-all duration-200 relative ${
                isActive("/messages") 
                  ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" 
                  : "text-gray-500 dark:text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <MessageCircle className="h-4 w-4 mb-0" />
              <span className="text-[10px] font-medium">Chat</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
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
              <User className="h-4 w-4 mb-0" />
              <span className="text-[10px] font-medium">Perfil</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
