import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, User, Lock, Mail, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { LifeBeeLogo } from "@/components/lifebee-logo";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Por enquanto, apenas redireciona para home
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-orange-500 to-secondary flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-white rounded-full -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24 md:-translate-y-32 md:translate-x-32 lg:-translate-y-48 lg:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-80 lg:h-80 bg-white rounded-full translate-y-12 -translate-x-12 sm:translate-y-20 sm:-translate-x-20 md:translate-y-28 md:-translate-x-28 lg:translate-y-40 lg:-translate-x-40"></div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-white rounded-full -translate-x-10 -translate-y-10 sm:-translate-x-16 sm:-translate-y-16 md:-translate-x-24 md:-translate-y-24 lg:-translate-x-32 lg:-translate-y-32"></div>
      </div>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative z-10">
        {/* Logo e Título */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-2xl">
            <div className="bg-white rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center">
              <LifeBeeLogo size={32} className="sm:w-12 sm:h-12 md:w-16 md:h-16" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">LifeBee</h1>
          <p className="text-white/80 text-xs sm:text-sm md:text-base px-4">Conecte-se com os melhores profissionais de saúde</p>
        </div>

        {/* Card de Login/Cadastro */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mx-2 sm:mx-0">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <Button
                variant="ghost"
                className={`flex-1 rounded-lg transition-all duration-200 text-sm sm:text-base py-2 sm:py-2 ${
                  isLogin
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setIsLogin(true)}
              >
                Entrar
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 rounded-lg transition-all duration-200 text-sm sm:text-base py-2 sm:py-2 ${
                  !isLogin
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setIsLogin(false)}
              >
                Cadastrar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 py-3 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-3 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-3 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg"
              >
                {isLogin ? "Entrar" : "Criar conta"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            {isLogin && (
              <div className="text-center pt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full py-3 rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar com Google
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/70 text-sm">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-white hover:text-white/80 font-medium underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="text-white hover:text-white/80 font-medium underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}