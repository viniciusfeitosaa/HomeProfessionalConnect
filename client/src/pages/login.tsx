import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, User, Lock, Mail, ArrowRight, Heart, Stethoscope, Phone, Shield, CheckCircle } from "lucide-react";
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
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const { toast } = useToast();

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const truncated = numbers.substring(0, 11);
    
    // Aplica a formatação baseada no tamanho
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

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleTraditionalAuth = async (e: React.FormEvent) => {
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
          username: email, // Usar email como username
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
          
          if (data.requiresPhoneVerification) {
            setVerificationStep(true);
            toast({
              title: "Código enviado!",
              description: "Verifique seu WhatsApp/SMS para o código de verificação",
            });
          } else {
            toast({
              title: "Conta criada com sucesso!",
              description: `Bem-vindo(a), ${data.user.name}`,
            });
            onLogin(data.user.userType);
          }
        } else {
          throw new Error(data.message || 'Erro no cadastro');
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro interno do servidor',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: verificationCode })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Telefone verificado!",
          description: "Sua conta foi verificada com sucesso",
        });
        onLogin(userType);
      } else {
        throw new Error(data.message || 'Código inválido');
      }
    } catch (error: any) {
      toast({
        title: "Erro na verificação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              <LifeBeeLogo size={50} className="sm:w-12 sm:h-12 md:w-16 md:h-16" />
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
            {verificationStep ? (
              <form onSubmit={handlePhoneVerification} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Verificação por SMS</h3>
                  <p className="text-sm text-gray-600">Digite o código de 6 dígitos enviado para seu telefone</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Código de Verificação</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="text-center text-xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verificando...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verificar Telefone
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <>
                <form onSubmit={handleTraditionalAuth} className="space-y-4">
                  {!isLogin && (
                    <>
                      {/* Seleção de Tipo de Usuário */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Você é:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={userType === "client" ? "default" : "outline"}
                        className={`p-4 h-auto flex flex-col items-center gap-2 ${
                          userType === "client" 
                            ? "bg-primary text-white" 
                            : "border-2 hover:border-primary"
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
                            ? "bg-primary text-white" 
                            : "border-2 hover:border-primary"
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
                          className="pl-10 py-3 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
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
                          className="pl-10 py-3 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
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

                  {!isLogin && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="password"
                        placeholder="Confirmar senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 py-3 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>
                  )}

              {!isLogin && userType === "provider" && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Área de atuação</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Após o cadastro, você poderá configurar seus serviços especializados em:
                    Fisioterapia, Acompanhamento hospitalar, Técnico em enfermagem
                  </p>
                </div>
              )}

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
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isLogin ? "Entrando..." : "Criando conta..."}
                      </div>
                    ) : (
                      <>
                        {isLogin ? "Entrar" : "Criar conta"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
            <Shield className="w-4 h-4" />
            <span>Protegido contra fraudes e bots</span>
          </div>
        </div>

        <div className="text-center mt-6 text-white/70 text-xs sm:text-sm">
          Ao continuar, você concorda com nossos{" "}
          <button className="underline hover:text-white">Termos de Serviço</button>
          {" "}e{" "}
          <button className="underline hover:text-white">Política de Privacidade</button>
        </div>
      </div>
    </div>
  );
}