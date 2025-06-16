import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LifeBeeLogo } from "./lifebee-logo";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  const { data: notificationData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
  });

  const notificationCount = notificationData?.count || 0;

  return (
    <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center flex-1 min-w-0">
        <div className="mr-3 lg:hidden">
          <LifeBeeLogo size={32} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
            Bem vindo, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Encontre o profissional de saúde ideal para você</p>
        </div>
      </div>
      <div className="relative ml-4 flex-shrink-0">
        <div className="bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-primary transition-colors" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {notificationCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
