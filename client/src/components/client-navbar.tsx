import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Calendar, MessageCircle, User } from "lucide-react";

interface ClientNavbarProps {
  hidePlus?: boolean;
}

export default function ClientNavbar({ hidePlus }: ClientNavbarProps) {
  const [location] = useLocation();

  const menuItems = [
    {
      label: "Início",
      to: "/",
      icon: <Home className="h-6 w-6" />,
      show: true,
    },
    {
      label: "Agenda",
      to: "/agenda",
      icon: <Calendar className="h-6 w-6" />,
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

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 w-full z-50 shadow rounded-t-xl px-0">
      <ul className="flex justify-around items-center h-16 max-w-full px-2 sm:px-4">
        {menuItems.filter(item => item.show).map((item) => (
          <li key={item.to} className={item.isCenter ? "relative -mt-10 z-10" : ""}>
            {item.isCenter ? (
              <Link href={item.to} aria-label="Criar Serviço">
                <button
                  className="gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl hover:shadow-2xl hover:from-yellow-600 hover:to-yellow-700 w-16 h-16 flex items-center justify-center transition-all duration-300 border-4 border-white dark:border-gray-900 focus:ring-4 focus:ring-yellow-200 dark:focus:ring-yellow-800 ring-4 ring-yellow-200 dark:ring-yellow-800"
                  tabIndex={0}
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-8 w-8"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                </button>
              </Link>
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