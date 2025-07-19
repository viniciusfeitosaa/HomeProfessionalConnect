import { BottomNavigationProvider } from "./bottom-navigation-provider";
import React from "react";

export function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      {/* Bottom navigation sempre visível */}
      <BottomNavigationProvider />
    </div>
  );
} 