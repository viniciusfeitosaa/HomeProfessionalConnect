import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, User, Lock, Mail, ArrowRight, Heart, Stethoscope, Phone } from "lucide-react";
import { LifeBeeLogo } from "@/components/lifebee-logo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LoginProps {
  onLogin: (userType: "client" | "provider") => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"client" | "provider">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const truncated = numbers.substring(0, 11);
    
    if (truncated.length <= 2) {
      return truncated;
    } else if (truncated.length <= 7) {
      return `(${truncated.substring(0, 2)}) ${truncated.substring(2)}`;
    } else {
      return `(${truncated.substring(0, 2)}) ${truncated.substring(2, 7)}-${truncated.substring(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await apiRequest('POST', '/api/auth/login', {
          email,
          password,
          userType
        });

        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo(a), ${data.user.name}`,
          });
          
          onLogin(data.user.userType);
        } else {
          throw new Error(data.message || 'Erro no login');
        }
      } else {
        // Registration
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        const response = await apiRequest('POST', '/api/auth/register', {
          username: email,
          email,
          password,
          name,
          userType,
          phone
        });

        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          toast({
            title: "Conta criada com sucesso!",
            description: `Bem-vindo(a), ${data.user.name}`,
          });
          onLogin(data.user.userType);
        } else {
          throw new Error(data.message || 'Erro no cadastro');
        }
      }
    } catch (error: any) {
      toast({
        title: isLogin ? "Erro no login" : "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left side - Branding */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-md w-full text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <LifeBeeLogo size={48} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">LifeBee</h1>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Cuidados Profissionais</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Conectamos você com profissionais de saúde qualificados
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Fisioterapeutas, técnicos em enfermagem e acompanhantes hospitalares prontos para cuidar de você
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              🏃‍♂️ Fisioterapia
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              💉 Enfermagem
            </Badge>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              🏥 Acompanhamento
            </Badge>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isLogin ? "Entrar na conta" : "Criar conta"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {isLogin 
                  ? "Acesse sua conta para continuar" 
                  : "Junte-se à nossa comunidade de cuidados"
                }
              </p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
              <Button
                variant="ghost"
                className={`flex-1 rounded-lg transition-all duration-200 text-sm sm:text-base py-2 ${
                  isLogin
                    ? "bg-white shadow-sm text-gray-900 dark:bg-gray-600 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
                onClick={() => setIsLogin(true)}
              >
                Entrar
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 rounded-lg transition-all duration-200 text-sm sm:text-base py-2 ${
                  !isLogin
                    ? "bg-white shadow-sm text-gray-900 dark:bg-gray-600 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
                onClick={() => setIsLogin(false)}
              >
                Cadastrar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  {/* Seleção de Tipo de Usuário */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Você é:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={userType === "client" ? "default" : "outline"}
                        className={`p-4 h-auto flex flex-col items-center gap-2 ${
                          userType === "client" 
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                            : "border-2 hover:border-yellow-500 hover:text-yellow-600"
                        }`}
                        onClick={() => setUserType("client")}
                      >
                        <Heart className="h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold text-sm">Cliente</div>
                          <div className="text-xs opacity-80">Preciso de cuidados</div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={userType === "provider" ? "default" : "outline"}
                        className={`p-4 h-auto flex flex-col items-center gap-2 ${
                          userType === "provider" 
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                            : "border-2 hover:border-yellow-500 hover:text-yellow-600"
                        }`}
                        onClick={() => setUserType("provider")}
                      >
                        <Stethoscope className="h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold text-sm">Profissional</div>
                          <div className="text-xs opacity-80">Ofereço serviços</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 py-3 rounded-xl border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="pl-10 py-3 rounded-xl border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-3 rounded-xl border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
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
                  className="pl-10 pr-10 py-3 rounded-xl border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
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

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 py-3 rounded-xl border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                    required
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full py-3 text-base font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isLogin ? "Entrando..." : "Cadastrando..."}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {isLogin ? "Entrar" : "Criar conta"}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}