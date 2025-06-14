import { Battery, Signal, Wifi } from "lucide-react";

export function StatusBar() {
  return (
    <div className="flex justify-between items-center px-4 py-2 bg-white text-black text-sm font-medium">
      <span>9:41</span>
      <div className="flex items-center space-x-1">
        <Signal className="h-3 w-3" />
        <Wifi className="h-3 w-3" />
        <Battery className="h-3 w-3" />
      </div>
    </div>
  );
}
