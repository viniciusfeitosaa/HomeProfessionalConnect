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
    <div className="flex justify-between items-center px-4 py-4 bg-white">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Bem vindo, {userName}!
        </h1>
      </div>
      <div className="relative">
        <Bell className="h-6 w-6 text-gray-600" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </div>
    </div>
  );
}
