import { Home, Send, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const menuItems = [
  { label: "Início", to: "/provider-dashboard", icon: <Home className="h-5 w-5" /> },
  { label: "Propostas", to: "/provider-proposals", icon: <Send className="h-5 w-5" /> },
  { label: "Chat", to: "/messages-provider", icon: <MessageCircle className="h-5 w-5" /> },
  { label: "Perfil", to: "/provider-profile", icon: <User className="h-5 w-5" /> },
];

export default function ProviderNavbar() {
  const [location] = useLocation();
  const { data: unreadData } = useUnreadMessages();
  const unreadCount = unreadData?.unreadCount || 0;
  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 w-full z-50 shadow rounded-t-xl px-0">
      <ul className="flex justify-around items-center h-14 max-w-full px-2 sm:px-4">
        {menuItems.map((item) => (
          <li key={item.to}>
            <Link
              href={item.to}
              className={`flex flex-col items-center text-[10px] font-medium transition-colors duration-200 relative ${
                location === item.to
                  ? "text-yellow-500"
                  : "text-gray-500 hover:text-yellow-500"
              }`}
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
              {item.label === "Chat" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
} 