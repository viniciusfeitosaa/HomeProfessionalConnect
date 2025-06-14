import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  const { data: notificationData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
  });

  const notificationCount = notificationData?.count || 0;

  return (
    <div className="flex justify-between items-center px-6 py-6 bg-gradient-to-r from-white to-gray-50">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Bem vindo, {userName}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">Encontre o profissional ideal para você</p>
      </div>
      <div className="relative">
        <div className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <Bell className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {notificationCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
