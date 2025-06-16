import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Calendar, MessageCircle, User } from "lucide-react";
import { Link } from "wouter";

export function Sidebar() {
  const [location] = useLocation();

  const isActiveRoute = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/agenda", icon: Calendar, label: "Agenda" },
    { href: "/messages", icon: MessageCircle, label: "Mensagens" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white/90 lg:backdrop-blur-lg lg:border-r lg:border-gray-200/50 lg:shadow-xl">
      <div className="flex flex-col w-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-8">
          <div className="bg-yellow-100 rounded-full w-10 h-10 flex items-center justify-center">
            <img 
              src="@assets/WhatsApp_Image_2025-06-16_at_11.07.32-removebg-preview_1750084602595.png" 
              alt="LifeBee Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            LifeBee
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActiveRoute(item.href)
                    ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  isActiveRoute(item.href) ? "text-primary" : ""
                }`} />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}