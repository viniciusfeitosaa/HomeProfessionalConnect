import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Home, Briefcase, MessageCircle, User } from "lucide-react";

interface ClientNavbarProps {
  hidePlus?: boolean;
}

export default function ClientNavbar({ hidePlus }: ClientNavbarProps) {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Ocultar navegação quando estiver em uma conversa específica (ex: /messages/7)
  const shouldHideNavigation = location.match(/^\/messages\/\d+$/);

  const menuItems = [
    {
      label: "Início",
      to: "/",
      icon: <Home className="h-6 w-6" />,
      show: true,
    },
    {
      label: "Serviços",
      to: "/services",
      icon: <Briefcase className="h-6 w-6" />,
      show: true,
    },
    {
      label: "Adicionar",
      to: "/servico",
      isCenter: true,
      show: !hidePlus,
    },
    {
      label: "Chat",
      to: "/messages",
      icon: <MessageCircle className="h-6 w-6" />,
      show: true,
    },
    {
      label: "Perfil",
      to: "/profile",
      icon: <User className="h-6 w-6" />,
      show: true,
    },
  ];

  // Se deve ocultar a navegação, retornar null
  if (shouldHideNavigation) {
    return null;
  }

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 w-full z-50 shadow rounded-t-xl px-0">
      <ul className="flex justify-around items-center h-16 max-w-full px-2 sm:px-4">
        {menuItems.filter(item => item.show).map((item) => (
          <li key={item.to} className={item.isCenter ? "relative -mt-10 z-10" : ""}>
            {item.isCenter ? (
              <button
                aria-label="Criar Serviço"
                onClick={() => {
                  // Log para debug
                  console.log('🔍 Verificando cadastro do usuário:', {
                    userExists: !!user,
                    email: user?.email,
                    phone: user?.phone,
                    cpfLocalStorage: localStorage.getItem('client_cpf')
                  });

                  // Se o user não existe OU não tem email/phone, pode estar carregando
                  if (!user || (!user.email && !user.phone)) {
                    console.warn('⚠️ Dados do usuário não disponíveis');
                    toast({
                      title: "Carregando dados...",
                      description: "Aguarde enquanto carregamos suas informações."
                    });
                    // Tentar novamente após 500ms
                    setTimeout(() => {
                      if (user?.email || user?.phone) {
                        setLocation('/servico');
                      }
                    }, 500);
                    return;
                  }

                  const emailOk = !!(user?.email && /.+@.+\..+/.test(user.email.trim()));
                  const digits = (user?.phone || "").replace(/\D/g, "");
                  const phoneOk = digits.length === 11 && digits[0] !== '0' && digits[1] !== '0' && digits[2] === '9';
                  const isValidCPF = (cpfRaw: string) => {
                    const cpf = cpfRaw.replace(/\D/g, '');
                    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
                    const calc = (b: number) => { let s = 0; for (let i = 0; i < b; i++) s += parseInt(cpf[i], 10) * (b + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
                    return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10);
                  };
                  const cpfStored = (typeof window !== 'undefined' ? localStorage.getItem('client_cpf') : '') || '';
                  const cpfOk = isValidCPF(cpfStored);
                  const steps = [emailOk, phoneOk, cpfOk].filter(Boolean).length;
                  
                  console.log('✅ Validações:', {
                    emailOk,
                    phoneOk,
                    cpfOk,
                    steps,
                    phoneDigits: digits,
                    cpfDigits: cpfStored.replace(/\D/g, '')
                  });

                  if (steps !== 3) {
                    const missingItems = [];
                    if (!emailOk) missingItems.push('Email válido');
                    if (!phoneOk) missingItems.push('Telefone válido (11 dígitos com 9 no início)');
                    if (!cpfOk) missingItems.push('CPF válido');
                    
                    console.warn('⚠️ Cadastro incompleto. Faltam:', missingItems);
                    
                    toast({
                      title: "Verificação em andamento",
                      description: `Conclua seu cadastro (${steps}/3): ${missingItems.join(', ')}`
                    });
                    setLocation('/profile');
                    return;
                  }
                  
                  console.log('✅ Todas as validações passaram! Redirecionando para /servico');
                  setLocation('/servico');
                }}
                className="gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl hover:shadow-2xl hover:from-yellow-600 hover:to-yellow-700 w-16 h-16 flex items-center justify-center transition-all duration-300 border-4 border-white dark:border-gray-900 focus:ring-4 focus:ring-yellow-200 dark:focus:ring-yellow-800 ring-4 ring-yellow-200 dark:ring-yellow-800"
                tabIndex={0}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-8 w-8"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              </button>
            ) : (
              <Link
                href={item.to}
                className={`flex flex-col items-center text-xs font-medium transition-colors duration-200 ${
                  location === item.to
                    ? "text-yellow-500"
                    : "text-gray-500 hover:text-yellow-500"
                }`}
              >
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
} 