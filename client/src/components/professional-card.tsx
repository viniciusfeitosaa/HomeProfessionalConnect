import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Professional } from "@shared/schema";

interface ProfessionalCardProps {
  professional: Professional;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const handleCardClick = () => {
    console.log("Opening professional profile:", professional.id);
  };

  return (
    <Card 
      className="mb-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={professional.imageUrl}
              alt={`${professional.name} - ${professional.service}`}
              className="w-16 h-16 rounded-xl object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {professional.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Serviços: {professional.service}
            </p>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {professional.distance} km
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-700">
                  {professional.rating}
                </span>
              </div>
            </div>
            <div>
              <Badge 
                variant={professional.available ? "default" : "secondary"}
                className={`
                  text-xs font-medium
                  ${professional.available
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }
                `}
              >
                <div 
                  className={`w-2 h-2 rounded-full mr-1 ${
                    professional.available ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                {professional.available ? "Disponível agora" : "Ocupado"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
