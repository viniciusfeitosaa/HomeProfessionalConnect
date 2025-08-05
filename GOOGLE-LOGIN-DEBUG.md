# Debug do Login com Google - LifeBee

## Problema Reportado
O usuário reportou que após clicar em "login com Google", aparece brevemente uma página de falha antes do login ser realizado com sucesso.

## Melhorias Implementadas

### 1. URLs Absolutas no Failure Redirect
**Arquivo:** `server/routes.ts`

**Problema:** O `failureRedirect: '/login'` estava usando uma URL relativa que pode não funcionar corretamente em todos os contextos.

**Solução:** Implementado URLs absolutas baseadas no ambiente:
```typescript
failureRedirect: process.env.NODE_ENV === 'production'
  ? 'https://lifebee.netlify.app/login?error=google_auth_failed'
  : 'http://localhost:5173/login?error=google_auth_failed'
```

### 2. Logs Detalhados no Backend
**Arquivo:** `server/routes.ts`

**Melhorias:**
- Logs com timestamps para rastrear o fluxo
- Logs mais detalhados no início e fim do callback
- Logs específicos para erros com stack trace
- URLs absolutas também no tratamento de erros

### 3. Logs Detalhados no Frontend
**Arquivo:** `client/src/pages/auth-callback.tsx`

**Melhorias:**
- Logs no início do componente AuthCallback
- Logs para cada etapa do processamento do token
- Logs para decodificação do JWT
- Logs para redirecionamentos
- Logs específicos para diferentes tipos de erro

## Como Testar

1. **Abrir o Console do Navegador** (F12)
2. **Acessar a página de login**
3. **Clicar em "Login com Google"**
4. **Observar os logs no console do navegador**
5. **Verificar os logs do servidor no terminal**

## Logs Esperados

### Backend (Terminal)
```
🔐 ===== GOOGLE OAUTH CALLBACK INICIADO =====
🔐 Timestamp: 2024-01-XX...
🔐 Query params: { code: '...' }
🔐 User object: { id: 1, email: '...', ... }
🔄 ===== REDIRECIONAMENTO FINAL =====
🔄 Redirecionando para: http://localhost:5173/auth-callback?token=...
🔄 ===== FIM DO CALLBACK =====
```

### Frontend (Console do Navegador)
```
🔄 AuthCallback iniciado
🔄 URL atual: http://localhost:5173/auth-callback?token=...
🔄 Token: Presente
🔄 UserType: client
✅ Token e userType presentes, processando...
✅ Token salvo no localStorage
🔍 Decodificando token...
🔍 Payload decodificado: { id: 1, email: '...', ... }
👤 Usuário processado: { id: 1, email: '...', ... }
✅ Usuário salvo no localStorage
🔄 Redirecionando para: /home
```

## Possíveis Causas da Página de Falha

1. **URLs Relativas:** O `failureRedirect` estava usando `/login` que pode não funcionar em todos os contextos
2. **Timing de Redirecionamento:** Pode haver um delay entre o callback e o redirecionamento final
3. **Erro Silencioso:** Algum erro pode estar sendo capturado pelo Passport.js sem ser logado

## Próximos Passos

1. **Testar o login com Google** e observar os logs
2. **Identificar se há erros** nos logs do backend ou frontend
3. **Verificar se a página de falha ainda aparece**
4. **Ajustar conforme necessário** baseado nos logs

## Status
✅ URLs absolutas implementadas
✅ Logs detalhados adicionados
✅ Servidor reiniciado com as mudanças
🔄 Aguardando teste do usuário 