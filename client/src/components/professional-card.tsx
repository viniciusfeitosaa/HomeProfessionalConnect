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
      className="mb-4 border-0 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white/80 backdrop-blur-sm shadow-md"
      onClick={handleCardClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={professional.imageUrl}
              alt={`${professional.name} - ${professional.service}`}
              className="w-18 h-18 rounded-2xl object-cover shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1 text-lg">
              {professional.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {professional.service}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current mr-2" />
                <span className="text-sm font-bold text-yellow-700">
                  {professional.rating}
                </span>
                <span className="text-xs text-gray-500 ml-1">avaliação</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  {professional.distance} km
                </span>
                <span className="text-xs text-gray-500 ml-1">distância</span>
              </div>
            </div>
            
            <div>
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
