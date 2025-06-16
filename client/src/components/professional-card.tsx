import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import type { Professional } from "@shared/schema";

interface ProfessionalCardProps {
  professional: Professional;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const [, setLocation] = useLocation();
  
  const handleCardClick = () => {
    setLocation(`/professional/${professional.id}`);
  };

  return (
    <Card 
      className="mb-4 lg:mb-0 border-0 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md h-full"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 sm:p-5 h-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 h-full">
          <div className="relative mb-4 sm:mb-0 flex-shrink-0 self-center sm:self-start">
            <img
              src={professional.imageUrl}
              alt={`${professional.name} - ${professional.service}`}
              className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-2xl object-cover shadow-lg mx-auto sm:mx-0"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">
              {professional.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {professional.service}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="flex items-center bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <Star className="h-3 w-3 text-yellow-500 fill-current mr-1.5" />
                  <span className="text-sm font-bold text-yellow-700">
                    {professional.rating}
                  </span>
                </div>
                <div className="flex items-center bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <MapPin className="h-3 w-3 text-gray-500 mr-1.5" />
                  <span className="text-sm font-medium text-gray-700">
                    {professional.distance} km
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center sm:justify-start">
              <Badge 
                className={`
                  text-xs font-medium border-0 rounded-full px-3 py-1.5
                  ${professional.available
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700"
                    : "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700"
                  }
                `}
              >
                {professional.available ? "Disponível agora" : "Ocupado"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
