import { LifeBeeLogo } from "./lifebee-logo";
import { NotificationButton } from "./notifications";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
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
        <NotificationButton />
      </div>
    </div>
  );
}
