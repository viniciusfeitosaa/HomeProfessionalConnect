import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="px-6 mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
        <Input
          type="text"
          placeholder="Busque por serviço ou profissional"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-gray-800 transition-all border-0 shadow-lg hover:shadow-xl font-medium"
        />
      </div>
    </div>
  );
}
