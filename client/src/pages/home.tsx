
import { Header } from "@/components/header";
import { AppointmentCard } from "@/components/appointment-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilters } from "@/components/category-filters";
import { ProfessionalCard } from "@/components/professional-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Sidebar } from "@/components/sidebar";
import { AdsCarousel } from "@/components/ads-carousel";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Professional, User, Appointment } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("médico");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <div className="lg:pl-64">
        <div className="w-full max-w-sm lg:max-w-none mx-auto lg:mx-0 min-h-screen relative">
          
          <Header userName={user?.name || "Gustavo"} />
          
          {currentAppointment && (
            <AppointmentCard appointment={currentAppointment} />
          )}
          
          {/* Área de Anúncios */}
          <div className="px-4 sm:px-6 lg:px-8 mb-6">
            <AdsCarousel />
          </div>
          
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <CategoryFilters 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <div className="px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
            {filteredProfessionals.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Nenhum profissional encontrado</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Tente ajustar sua busca ou categoria</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {filteredProfessionals.map((professional) => (
                  <ProfessionalCard 
                    key={professional.id} 
                    professional={professional} 
                  />
                ))}
              </div>
            )}
          </div>
          
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}
