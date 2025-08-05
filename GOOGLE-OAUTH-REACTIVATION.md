# Reativação do Google OAuth após Deploy

## Status Atual
- ✅ Google OAuth temporariamente desabilitado para permitir deploy
- ✅ Backend funcionando sem OAuth
- ✅ Login tradicional funcionando normalmente

## Como Reativar o Google OAuth

### 1. Configurar Variáveis de Ambiente no Render
No dashboard do Render, adicione as seguintes variáveis de ambiente:

```
GOOGLE_CLIENT_ID=seu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_google_client_secret_aqui
```

### 2. Descomentar o Código
Edite os seguintes arquivos e descomente o código:

#### `server/auth.ts`
```typescript
// Descomentar as linhas 15-75 (Google OAuth Strategy)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.NODE_ENV === 'production' 
    ? "https://lifebee.netlify.app/api/auth/google/callback"
    : "http://localhost:5000/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // ... resto do código
}));
```

#### `server/routes.ts`
```typescript
// Descomentar as linhas 1853-1920 (Google OAuth routes)
app.get('/api/auth/google', (req, res, next) => {
  // ... logs e autenticação
}, passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/api/auth/google/callback', passport.authenticate('google', { 
  failureRedirect: '/login',
  session: false 
}), async (req, res) => {
  // ... callback logic
});
```

### 3. Fazer Redeploy
Após configurar as variáveis e descomentar o código:
1. Faça commit das mudanças
2. Push para o GitHub
3. O Render fará deploy automático

### 4. Testar
- Teste o login Google na aplicação
- Verifique se o callback está funcionando
- Confirme se os tokens estão sendo gerados

## URLs de Callback Configuradas

### Desenvolvimento
- `http://localhost:5000/api/auth/google/callback`

### Produção
- `https://lifebee.netlify.app/api/auth/google/callback`

## Notas Importantes
- O Google OAuth só funcionará após configurar as variáveis de ambiente
- O login tradicional continuará funcionando normalmente
- O Apple OAuth também está comentado e pode ser reativado seguindo o mesmo processo 