import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Ad {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

const adsData: Ad[] = [
  {
    id: 1,
    title: "Consulta Médica Domiciliar",
    description: "Médicos especialistas na sua casa. Agende agora!",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop",
    ctaText: "Agendar Consulta",
    ctaLink: "#"
  },
  {
    id: 2,
    title: "Fisioterapia em Casa",
    description: "Recupere-se no conforto do seu lar com nossos fisioterapeutas",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop",
    ctaText: "Saiba Mais",
    ctaLink: "#"
  },
  {
    id: 3,
    title: "Cuidadores Especializados",
    description: "Cuidado 24h para seus entes queridos",
    imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop",
    ctaText: "Contratar",
    ctaLink: "#"
  }
];

export function AdsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === adsData.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? adsData.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === adsData.length - 1 ? 0 : currentIndex + 1);
  };

  const currentAd = adsData[currentIndex];

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${currentAd.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
            {currentAd.title}
          </h3>
          <p className="text-sm sm:text-base text-white/90 mb-4 max-w-md">
            {currentAd.description}
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base"
            onClick={() => window.open(currentAd.ctaLink, '_blank')}
          >
            {currentAd.ctaText}
          </Button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1 sm:p-2 transition-all duration-200"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1 sm:p-2 transition-all duration-200"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {adsData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? "bg-white" 
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}