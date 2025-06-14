import { Button } from "@/components/ui/button";

interface CategoryFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "encanador", label: "Encanador" },
  { id: "eletricista", label: "Eletricista" },
  { id: "ar-condicionado", label: "Ar-Condicionado" },
  { id: "pintura", label: "Pintura" },
];

export function CategoryFilters({ selectedCategory, onCategoryChange }: CategoryFiltersProps) {
  return (
    <div className="px-6 mb-6">
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "secondary"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={`
              px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border-0 shadow-md hover:shadow-lg hover:scale-105
              ${selectedCategory === category.id
                ? "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl"
                : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white"
              }
            `}
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
