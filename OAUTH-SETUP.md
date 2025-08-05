# Configuração OAuth - Google e Apple

Este documento explica como configurar o login social com Google e Apple no projeto LifeBee.

## 1. Configuração do Google OAuth

### 1.1 Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google+ API" ou "Google Identity"
4. Vá para "Credenciais" > "Criar credenciais" > "ID do cliente OAuth 2.0"
5. Configure o tipo de aplicativo como "Aplicativo da Web"
6. Adicione as URLs de redirecionamento:
   - Desenvolvimento: `http://localhost:5000/api/auth/google/callback`
   - Produção: `https://https://lifebee.netlify.app//api/auth/google/callback`
7. Copie o **Client ID** e **Client Secret**

### 1.2 Variáveis de Ambiente
Adicione ao arquivo `.env` na raiz do projeto:
```env
GOOGLE_CLIENT_ID=seu-google-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-google-client-secret-aqui
```

## 2. Configuração do Apple OAuth

### 2.1 Apple Developer Console
1. Acesse [Apple Developer](https://developer.apple.com/)
2. Vá para "Certificates, Identifiers & Profiles"
3. Crie um novo "App ID" ou use um existente
4. Ative "Sign In with Apple"
5. Configure as URLs de redirecionamento:
   - Desenvolvimento: `http://localhost:5000/api/auth/apple/callback`
   - Produção: `https://seu-dominio.com/api/auth/apple/callback`
6. Copie o **Client ID** e gere um **Client Secret**

### 2.2 Variáveis de Ambiente
Adicione ao arquivo `.env` na raiz do projeto:
```env
APPLE_CLIENT_ID=seu-apple-client-id-aqui
APPLE_CLIENT_SECRET=seu-apple-client-secret-aqui
```

## 3. Configuração Completa do .env

Crie um arquivo `.env` na raiz do projeto com todas as variáveis necessárias:

```env
# Configurações do Banco de Dados (Neon)
DATABASE_URL=postgresql://seu-usuario:sua-senha@seu-host-neon:5432/seu-banco?sslmode=require

# Configurações JWT
JWT_SECRET=sua-chave-secreta-jwt-aqui

# Ambiente
NODE_ENV=development

# Porta do servidor
PORT=5000

# OAuth Google
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# OAuth Apple
APPLE_CLIENT_ID=seu-apple-client-id
APPLE_CLIENT_SECRET=seu-apple-client-secret
```

## 4. Atualização das URLs de Produção

### 4.1 No arquivo `server/auth.ts`
Substitua `https://your-domain.com` pela URL real do seu domínio:
```typescript
callbackURL: process.env.NODE_ENV === 'production'
  ? "https://seu-dominio-real.com/api/auth/google/callback"
  : "http://localhost:5000/api/auth/google/callback"
```

### 4.2 No arquivo `server/routes.ts`
Substitua `https://your-domain.com` pela URL real do seu domínio:
```typescript
const redirectUrl = process.env.NODE_ENV === 'production'
  ? `https://seu-dominio-real.com/auth-callback?token=${token}&userType=${user.userType}`
  : `http://localhost:5173/auth-callback?token=${token}&userType=${user.userType}`;
```

## 5. Testando a Configuração

### 5.1 Desenvolvimento Local
1. Certifique-se de que o servidor está rodando na porta 5000
2. Certifique-se de que o cliente está rodando na porta 5173
3. Acesse `http://localhost:5173/login`
4. Clique nos botões "Continuar com Google" ou "Continuar com Apple"

### 5.2 Verificação de Logs
- Verifique os logs do servidor para erros de autenticação
- Verifique o console do navegador para erros de JavaScript
- Verifique se as URLs de redirecionamento estão corretas

## 6. Solução de Problemas

### 6.1 Erro "Invalid redirect_uri"
- Verifique se as URLs de redirecionamento no Google/Apple Console correspondem exatamente às URLs no código
- Certifique-se de que não há espaços extras ou caracteres especiais

### 6.2 Erro "Client ID not found"
- Verifique se as variáveis de ambiente estão configuradas corretamente
- Reinicie o servidor após adicionar as variáveis de ambiente

### 6.3 Erro "useNavigate not found"
- Este erro foi corrigido removendo a dependência do wouter no arquivo `auth-callback.tsx`
- O arquivo agora usa `window.location.href` para navegação

### 6.4 Erro de CORS
- Verifique se as configurações de CORS no servidor estão corretas
- Certifique-se de que o domínio está na lista de origens permitidas

## 7. Deploy em Produção

### 7.1 Render.com
1. Configure as variáveis de ambiente no painel do Render
2. Atualize as URLs de redirecionamento para o domínio de produção
3. Certifique-se de que o banco de dados está configurado

### 7.2 Netlify
1. Configure as variáveis de ambiente no painel do Netlify
2. Atualize as URLs de redirecionamento para o domínio de produção
3. Configure as funções serverless se necessário

## 8. Segurança

- Nunca commite as credenciais OAuth no repositório
- Use variáveis de ambiente para todas as credenciais
- Configure HTTPS em produção
- Implemente rate limiting para as rotas de autenticação
- Valide e sanitize todos os dados recebidos dos provedores OAuth 