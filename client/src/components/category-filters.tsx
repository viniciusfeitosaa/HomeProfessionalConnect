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
    <div className="px-4 mb-6">
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "secondary"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${selectedCategory === category.id
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
