import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LifeBeeLogo } from '@/components/lifebee-logo';

export default function AuthCallback() {
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔄 AuthCallback iniciado');
    console.log('🔄 URL atual:', window.location.href);
    console.log('🔄 Search params:', window.location.search);
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userType = urlParams.get('userType');
    const error = urlParams.get('error');

    console.log('🔄 Token:', token ? 'Presente' : 'Ausente');
    console.log('🔄 UserType:', userType);
    console.log('🔄 Error:', error);

    if (error) {
      console.log('❌ Erro detectado:', error);
      toast({
        title: "Erro na autenticação",
        description: error === 'google_auth_failed'
          ? "Falha no login com Google"
          : "Falha no login com Apple",
        variant: "destructive",
      });
      window.location.href = '/login';
      return;
    }

    if (token && userType) {
      console.log('✅ Token e userType presentes, processando...');
      
      // Salvar token e dados do usuário
      localStorage.setItem('token', token);
      console.log('✅ Token salvo no localStorage');
      
      // Decodificar o token para obter informações do usuário
      try {
        console.log('🔍 Decodificando token...');
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Payload decodificado:', payload);
        
        const user = {
          id: payload.id,
          email: payload.email,
          userType: payload.userType,
          name: payload.name || 'Usuário'
        };
        
        console.log('👤 Usuário processado:', user);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Usuário salvo no localStorage');
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a), ${user.name}`,
        });
        
        // Redirecionar baseado no tipo de usuário
        const redirectUrl = userType === 'provider' ? '/provider-dashboard' : '/home';
        console.log('🔄 Redirecionando para:', redirectUrl);
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('❌ Erro ao decodificar token:', error);
        toast({
          title: "Erro na autenticação",
          description: "Token inválido",
          variant: "destructive",
        });
        console.log('🔄 Redirecionando para /login devido a erro no token');
        window.location.href = '/login';
      }
    } else {
      console.log('❌ Token ou userType ausentes');
      toast({
        title: "Erro na autenticação",
        description: "Dados de autenticação inválidos",
        variant: "destructive",
      });
      console.log('🔄 Redirecionando para /login devido a dados inválidos');
      window.location.href = '/login';
    }
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <LifeBeeLogo size={48} className="text-yellow-600 dark:text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LifeBee</h1>
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">Cuidados Profissionais</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Processando autenticação...
          </p>
        </div>
      </div>
    </div>
  );
} 