import ProviderNavbar from "./provider-navbar";
import React from "react";

export function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      {/* Menu do provider sempre visível */}
      <ProviderNavbar />
    </div>
  );
} 