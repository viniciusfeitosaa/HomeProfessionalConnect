import { useEffect, useState } from "react";
import { LifeBeeLogo } from "@/components/lifebee-logo";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#f4c430] to-[#fdf6e3] flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="bg-[#fdf6e3]/20 backdrop-blur-sm rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-2xl animate-pulse">
          <div className="bg-[#fdf6e3] rounded-full w-24 h-24 flex items-center justify-center">
            <LifeBeeLogo size={60} className="animate-bounce" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-[#fdf6e3] mb-2">LifeBee</h1>
        <p className="text-[#fdf6e3]/80 text-lg mb-8">Conectando você aos melhores profissionais de saúde</p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto bg-[#fdf6e3]/20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#fdf6e3] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[#fdf6e3]/70 text-sm mt-4">Carregando... {progress}%</p>
      </div>
    </div>

  );
}