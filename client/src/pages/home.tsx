
import { Header } from "@/components/header";
import { AppointmentCard } from "@/components/appointment-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilters } from "@/components/category-filters";
import { ProfessionalCard } from "@/components/professional-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Professional, User, Appointment } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("encanador");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ["/api/professionals", { category: selectedCategory, search: searchQuery }],
  });

  const currentAppointment = appointments.find(apt => 
    new Date(apt.scheduledFor) > new Date()
  );

  const filteredProfessionals = professionals.filter(prof => {
    if (searchQuery) {
      return prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             prof.service.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return selectedCategory === "all" || prof.category === selectedCategory;
  });

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative">
      
      <Header userName={user?.name || "Gustavo"} />
      
      {currentAppointment && (
        <AppointmentCard appointment={currentAppointment} />
      )}
      
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <CategoryFilters 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <div className="px-4 pb-20">
        {filteredProfessionals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum profissional encontrado</p>
          </div>
        ) : (
          filteredProfessionals.map((professional) => (
            <ProfessionalCard 
              key={professional.id} 
              professional={professional} 
            />
          ))
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}
