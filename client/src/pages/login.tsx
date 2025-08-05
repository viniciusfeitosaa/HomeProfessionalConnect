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

  // Estados de validação
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  // Funções de validação
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email é obrigatório";
    if (!emailRegex.test(email)) return "Digite um email válido";
    if (email.length > 100) return "Email muito longo";
    return "";
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    if (!phone) return "Telefone é obrigatório";
    if (!phoneRegex.test(phone)) return "Digite um telefone válido: (11) 99999-9999";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Senha é obrigatória";
    if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres";
    if (!/(?=.*[a-z])/.test(password)) return "Senha deve conter pelo menos uma letra minúscula";
    if (!/(?=.*[A-Z])/.test(password)) return "Senha deve conter pelo menos uma letra maiúscula";
    if (!/(?=.*\d)/.test(password)) return "Senha deve conter pelo menos um número";
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) return "Senha deve conter pelo menos um caractere especial";
    if (password.length > 50) return "Senha muito longa";
    return "";
  };

  const validateName = (name: string) => {
    if (!name) return "Nome é obrigatório";
    if (name.length < 2) return "Nome deve ter pelo menos 2 caracteres";
    if (name.length > 100) return "Nome muito longo";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) return "Nome deve conter apenas letras";
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return "Confirme sua senha";
    if (confirmPassword !== password) return "As senhas não coincidem";
    return "";
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: "bg-gray-200", text: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) score++;
    
    if (score <= 1) return { strength: score, color: "bg-red-500", text: "Muito fraca" };
    if (score <= 2) return { strength: score, color: "bg-orange-500", text: "Fraca" };
    if (score <= 3) return { strength: score, color: "bg-yellow-500", text: "Média" };
    if (score <= 4) return { strength: score, color: "bg-blue-500", text: "Forte" };
    return { strength: score, color: "bg-green-500", text: "Muito forte" };
  };

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
    if (!isLogin) {
      setPhoneError(validatePhone(formatted));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Aplicar validação forte apenas no modo de cadastro
    if (!isLogin) {
      setPasswordError(validatePassword(value));
    } else {
      // No login, apenas limpar erro se o campo não estiver vazio
      setPasswordError(value ? "" : "Senha é obrigatória");
    }
    
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(validateConfirmPassword(value));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (!isLogin) {
      setNameError(validateName(value));
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    console.log('🔐 Iniciando login social:', provider);
    setIsLoading(true);
    
    try {
      // Usar a URL completa do backend
      const backendUrl = import.meta.env.DEV ? 'http://localhost:5000' : 'https://lifebee-backend.onrender.com';
      const authUrl = `${backendUrl}/api/auth/${provider}`;
      console.log('🔐 URL de autenticação:', authUrl);
      console.log('🔐 Redirecionando diretamente...');
      
      // Redirecionar diretamente, sem verificação HEAD
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('❌ Erro no login social:', error);
      setIsLoading(false);
      toast({
        title: "Erro no login social",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearErrors = () => {
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNameError("");
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    clearErrors();
    
    // Se estiver mudando para login, limpar validação de senha forte
    if (!isLogin) {
      setPasswordError("");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas para login (email válido e senha não vazia)
    const emailValidation = validateEmail(email);
    const passwordValidation = !password ? "Senha é obrigatória" : "";
    
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    
    if (!isLogin) {
      // Validações completas apenas para cadastro
      const nameValidation = validateName(name);
      const phoneValidation = validatePhone(phone);
      const confirmPasswordValidation = validateConfirmPassword(confirmPassword);
      const strongPasswordValidation = validatePassword(password); // Validação forte apenas no cadastro
      
      setNameError(nameValidation);
      setPhoneError(phoneValidation);
      setConfirmPasswordError(confirmPasswordValidation);
      setPasswordError(strongPasswordValidation);
      
      // Se há erros de validação no cadastro, não prossegue
      if (emailValidation || strongPasswordValidation || nameValidation || phoneValidation || confirmPasswordValidation) {
        toast({
          title: "Erro de validação",
          description: "Por favor, corrija os campos destacados",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Para login, apenas verifica se os campos não estão vazios
      if (emailValidation || passwordValidation) {
        toast({
          title: "Erro de validação",
          description: "Por favor, preencha todos os campos",
          variant: "destructive",
        });
        return;
      }
    }
    
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
                 onClick={() => {
                   setIsLogin(true);
                   clearErrors();
                 }}
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
                 onClick={() => {
                   setIsLogin(false);
                   clearErrors();
                 }}
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
                       onChange={handleNameChange}
                       className={`h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 ${
                         nameError ? "border-red-500 focus:border-red-500" : ""
                       }`}
                       autoComplete="name"
                       required={!isLogin}
                     />
                     {nameError && (
                       <p className="text-xs text-red-500 dark:text-red-400">{nameError}</p>
                     )}
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
                       className={`h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 ${
                         phoneError ? "border-red-500 focus:border-red-500" : ""
                       }`}
                       autoComplete="tel"
                       required={!isLogin}
                     />
                     {phoneError && (
                       <p className="text-xs text-red-500 dark:text-red-400">{phoneError}</p>
                     )}
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
                   onChange={handleEmailChange}
                   className={`h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 ${
                     emailError ? "border-red-500 focus:border-red-500" : ""
                   }`}
                   autoComplete="email"
                   required
                 />
                 {emailError && (
                   <p className="text-xs text-red-500 dark:text-red-400">{emailError}</p>
                 )}
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
                   onChange={handlePasswordChange}
                   className={`h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 pr-10 ${
                     passwordError ? "border-red-500 focus:border-red-500" : ""
                   }`}
                   autoComplete={isLogin ? "current-password" : "new-password"}
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
                 {passwordError && (
                   <p className="text-xs text-red-500 dark:text-red-400">{passwordError}</p>
                 )}
                 {!isLogin && password && (
                   <div className="space-y-1">
                     <div className="flex gap-1">
                       {[1, 2, 3, 4, 5].map((level) => {
                         const strength = getPasswordStrength(password);
                         return (
                           <div
                             key={level}
                             className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                               level <= strength.strength ? strength.color : "bg-gray-200"
                             }`}
                           />
                         );
                       })}
                     </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                       Força da senha: {getPasswordStrength(password).text}
                     </p>
                   </div>
                 )}
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
                     onChange={handleConfirmPasswordChange}
                     className={`h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 ${
                       confirmPasswordError ? "border-red-500 focus:border-red-500" : ""
                     }`}
                     autoComplete="new-password"
                     required={!isLogin}
                   />
                   {confirmPasswordError && (
                     <p className="text-xs text-red-500 dark:text-red-400">{confirmPasswordError}</p>
                   )}
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
                    onClick={handleToggleMode}
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

             {/* Botões de Login Social */}
             <div className="space-y-2 sm:space-y-3">
               <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                   <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                 </div>
                 <div className="relative flex justify-center text-xs sm:text-sm">
                   <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                     Ou continue com
                   </span>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-2 sm:gap-3">
                 <Button
                   type="button"
                   variant="outline"
                   className="h-10 sm:h-12 flex items-center justify-center gap-2 text-xs sm:text-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                   onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     console.log('🔘 Botão Google clicado!');
                     console.log('🔘 Estado isLoading:', isLoading);
                     console.log('🔘 Evento:', e);
                     console.log('🔘 Target:', e.target);
                     console.log('🔘 Current Target:', e.currentTarget);
                     if (!isLoading) {
                       handleSocialLogin('google');
                     } else {
                       console.log('❌ Botão desabilitado devido ao estado de loading');
                     }
                   }}
                   disabled={isLoading}
                 >
                   <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                   </svg>
                   Google
                 </Button>
                 
                 <Button
                   type="button"
                   variant="outline"
                   className="h-10 sm:h-12 flex items-center justify-center gap-2 text-xs sm:text-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                   onClick={() => handleSocialLogin('apple')}
                   disabled={isLoading}
                 >
                   <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                   </svg>
                   Apple
                 </Button>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}