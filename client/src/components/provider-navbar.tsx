import { Home, Calendar, MessageCircle, ClipboardList, User } from "lucide-react";
import { Link, useLocation } from "wouter";

const menuItems = [
  { label: "Início", to: "/provider-dashboard", icon: <Home className="h-6 w-6" /> },
  { label: "Agenda", to: "/agenda-profissional", icon: <Calendar className="h-6 w-6" /> },
  { label: "Chat", to: "/messages-provider", icon: <MessageCircle className="h-6 w-6" /> },
  { label: "Pedidos", to: "/provider-orders", icon: <ClipboardList className="h-6 w-6" /> },
  { label: "Perfil", to: "/provider-profile", icon: <User className="h-6 w-6" /> },
];

export default function ProviderNavbar() {
  const [location] = useLocation();
  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 w-full z-50 shadow rounded-t-xl px-0">
      <ul className="flex justify-around items-center h-16 max-w-full px-2 sm:px-4">
        {menuItems.map((item) => (
          <li key={item.to}>
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
          </li>
        ))}
      </ul>
    </nav>
  );
} 