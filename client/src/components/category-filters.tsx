import { Button } from "@/components/ui/button";

interface CategoryFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "fisioterapeuta", label: "🏃‍♂️ Fisioterapeuta" },
  { id: "acompanhante_hospitalar", label: "🏥 Acompanhante Hospitalar" },
  { id: "tecnico_enfermagem", label: "💉 Técnico em Enfermagem" },
];

export function CategoryFilters({ selectedCategory, onCategoryChange }: CategoryFiltersProps) {
  return (
    <div className="px-6 mb-6">
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide pt-[5px] pb-[5px]">
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
                : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
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
