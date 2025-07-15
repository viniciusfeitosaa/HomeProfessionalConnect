import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, User, ArrowRight, Stethoscope } from "lucide-react";
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
        <div className="max-w-md w-full text-center lg:text-left space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
            <LifeBeeLogo size={40} className="sm:w-12 sm:h-12" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">LifeBee</h1>
              <p className="text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm font-medium">Cuidados Profissionais</p>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Conectamos você com profissionais de saúde qualificados
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg">
              Fisioterapeutas, técnicos em enfermagem e acompanhantes hospitalares prontos para cuidar de você
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs sm:text-sm">
              🏃‍♂️ Fisioterapia
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs sm:text-sm">
              💉 Enfermagem
            </Badge>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs sm:text-sm">
              🏥 Acompanhamento
            </Badge>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-3 sm:space-y-4 pb-4 sm:pb-6">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isLogin ? "Entrar na conta" : "Criar conta"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                {isLogin 
                  ? "Acesse sua conta para continuar" 
                  : "Junte-se à nossa comunidade de cuidados"
                }
              </p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex w-full">
              <Button
                variant="ghost"
                className={`flex-1 rounded-lg transition-all duration-200 text-xs sm:text-sm lg:text-base py-2 sm:py-3 lg:py-4 px-2 sm:px-4 lg:px-6 ${
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
                className={`flex-1 rounded-lg transition-all duration-200 text-xs sm:text-sm lg:text-base py-2 sm:py-3 lg:py-4 px-2 sm:px-4 lg:px-6 ${
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

          <CardContent className="space-y-3 sm:space-y-4">
            <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
              {!isLogin && (
                <>
                  {/* Seleção de Tipo de Usuário */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Você é:</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                      <Button
                        type="button"
                        variant={userType === "client" ? "default" : "outline"}
                        className={`h-10 sm:h-12 lg:h-14 text-xs sm:text-sm lg:text-base px-2 sm:px-4 lg:px-6 ${
                          userType === "client" 
                            ? "bg-yellow-500 hover:bg-yellow-600" 
                            : "border-gray-300"
                        }`}
                        onClick={() => setUserType("client")}
                      >
                        <User className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                        Cliente
                      </Button>
                      <Button
                        type="button"
                        variant={userType === "provider" ? "default" : "outline"}
                        className={`h-10 sm:h-12 lg:h-14 text-xs sm:text-sm lg:text-base px-2 sm:px-4 lg:px-6 ${
                          userType === "provider" 
                            ? "bg-yellow-500 hover:bg-yellow-600" 
                            : "border-gray-300"
                        }`}
                        onClick={() => setUserType("provider")}
                      >
                        <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                        Profissional
                      </Button>
                    </div>
                  </div>

                  {/* Nome */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nome completo
                    </label>
                    <Input
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4"
                      required={!isLogin}
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4"
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4"
                  required
                />
              </div>

              {/* Senha */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                    className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 pr-10"
                  required
                />
                  <Button
                  type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 sm:h-12 w-10 sm:w-12 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirmar Senha (apenas para registro) */}
              {!isLogin && (
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmar senha
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Botão de Submit */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-10 sm:h-12 lg:h-14 bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? "Entrando..." : "Cadastrando..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{isLogin ? "Entrar" : "Criar conta"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Links adicionais */}
            <div className="text-center space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                <button
                  type="button"
                  className="ml-1 text-yellow-600 hover:text-yellow-700 font-medium"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Cadastre-se" : "Faça login"}
                </button>
              </p>
              
              {isLogin && (
                <button
                  type="button"
                  className="text-xs sm:text-sm text-yellow-600 hover:text-yellow-700"
                >
                  Esqueceu sua senha?
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}