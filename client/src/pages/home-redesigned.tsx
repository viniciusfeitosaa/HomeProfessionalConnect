import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Settings, Search, Home as HomeIcon, MessageCircle, ShoppingBag, Calendar, User as UserIcon } from "lucide-react";
import { useLocation } from "wouter";
import type { Professional, User } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("services");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ["/api/professionals"],
  });

  const { data: notificationData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
  });

  const notificationCount = notificationData?.count || 0;
  const topProfessional = professionals.find(prof => prof.rating && parseFloat(prof.rating) >= 4.8);

  const services = [
    { icon: "🏠", label: "Gestão do Lar", category: "acompanhante_hospitalar" },
    { icon: "🤝", label: "Cuidados Paliativos", category: "acompanhante_hospitalar" },
    { icon: "🧑‍🦽", label: "Acompanhante Hospitalar", category: "acompanhante_hospitalar" },
    { icon: "🧑‍⚕️", label: "Fisioterapia", category: "fisioterapeuta" },
    { icon: "🧑‍🤝‍🧑", label: "Apoio Emocional", category: "acompanhante_hospitalar" },
    { icon: "🩺", label: "Exames Domiciliares", category: "tecnico_enfermagem" },
  ];

  const handleServiceClick = (category: string) => {
    console.log("Navegando para categoria:", category);
  };

  const handleNavigation = (page: string) => {
    switch (page) {
      case "Chat":
        setLocation("/messages");
        break;
      case "Pedidos":
        setLocation("/agenda");
        break;
      case "Agenda":
        setLocation("/agenda");
        break;
      case "Perfil":
        setLocation("/profile");
        break;
      default:
        setLocation("/");
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black">
        <div>
          <p className="text-sm text-gray-400">Olá,</p>
          <p className="font-semibold text-lg">{user?.name || "Usuário"}</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-300 hover:text-white cursor-pointer" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {notificationCount}
              </span>
            )}
          </div>
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-black" />
          </div>
        </div>
      </div>

      {/* Botões Serviços e Lojas */}
      <div className="flex justify-around mt-2 px-4">
        <button 
          className={`flex-1 mx-2 py-3 rounded-full font-medium transition-colors ${
            activeTab === "services" 
              ? "bg-yellow-500 text-black" 
              : "bg-gray-800 text-white"
          }`}
          onClick={() => setActiveTab("services")}
        >
          Serviços
        </button>
        <button 
          className={`flex-1 mx-2 py-3 rounded-full font-medium transition-colors ${
            activeTab === "stores" 
              ? "bg-yellow-500 text-black" 
              : "bg-gray-800 text-white"
          }`}
          onClick={() => setActiveTab("stores")}
        >
          Lojas
        </button>
      </div>

      {/* Busca */}
      <div className="p-4">
        <div className="flex items-center bg-white text-black rounded-full px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Qual serviço precisa hoje?"
            className="flex-1 outline-none bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Settings className="h-5 w-5 text-gray-400 ml-3" />
        </div>
      </div>

      {/* Banner */}
      <div className="overflow-x-scroll flex space-x-4 px-4 mb-4">
        <div className="w-80 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <div className="text-center">
            <h3 className="text-black font-bold text-lg">LifeBee Premium</h3>
            <p className="text-black text-sm">Atendimento prioritário</p>
          </div>
        </div>
        <div className="w-80 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <div className="text-center">
            <h3 className="text-white font-bold text-lg">Emergência 24h</h3>
            <p className="text-white text-sm">Profissionais disponíveis</p>
          </div>
        </div>
      </div>

      {/* Serviços mais procurados */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Serviços mais procurados</h2>
          <button className="text-yellow-400 text-sm font-medium">Ver tudo</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {services.map((item, index) => (
            <button
              key={index}
              className="bg-yellow-400 text-black rounded-xl flex flex-col items-center p-3 hover:bg-yellow-300 transition-colors"
              onClick={() => handleServiceClick(item.category)}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-center text-xs font-medium leading-tight">{item.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Top Bees */}
      {topProfessional && (
        <div className="px-4 mt-6 mb-20">
          <h2 className="text-lg font-bold mb-3">Top Bees</h2>
          <div className="bg-white text-black rounded-xl flex items-center p-4 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-4">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{topProfessional.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{topProfessional.specialization}</p>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">⭐</span>
                <span className="text-sm font-medium">
                  {topProfessional.rating} ({topProfessional.totalReviews} Avaliações)
                </span>
              </div>
            </div>
            <button 
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium text-sm"
              onClick={() => setLocation(`/professional/${topProfessional.id}`)}
            >
              Ver perfil
            </button>
          </div>
        </div>
      )}

      {/* Menu Inferior */}
      <nav className="fixed bottom-0 w-full bg-black text-white flex justify-around py-3 border-t border-gray-700">
        {[
          { icon: HomeIcon, label: "Início" },
          { icon: MessageCircle, label: "Chat" },
          { icon: ShoppingBag, label: "Pedidos" },
          { icon: Calendar, label: "Agenda" },
          { icon: UserIcon, label: "Perfil" }
        ].map((item, index) => (
          <button 
            key={index} 
            className="flex flex-col items-center text-xs hover:text-yellow-400 transition-colors"
            onClick={() => handleNavigation(item.label)}
          >
            <item.icon className="h-5 w-5 mb-1" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}