# Configuração do Google Console para OAuth

## Passos para Configurar o Google OAuth

### 1. Acessar o Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Selecione seu projeto ou crie um novo

### 2. Habilitar a API do Google+ 
- Vá para "APIs & Services" > "Library"
- Procure por "Google+ API" ou "Google Identity"
- Clique em "Enable"

### 3. Criar Credenciais OAuth 2.0
- Vá para "APIs & Services" > "Credentials"
- Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
- Selecione "Web application"

### 4. Configurar URLs Autorizadas

#### Authorized JavaScript origins:
```
http://localhost:5173
http://localhost:5000
https://lifebee.netlify.app
```

#### Authorized redirect URIs:
```
http://localhost:5000/api/auth/google/callback
https://lifebee.netlify.app/api/auth/google/callback
```

### 5. Verificar Configuração

Após configurar, você deve ter:
- **Client ID**: Copie para `GOOGLE_CLIENT_ID` no .env
- **Client Secret**: Copie para `GOOGLE_CLIENT_SECRET` no .env

### 6. Testar Configuração

1. **Teste a configuração:**
   ```bash
   curl http://localhost:5000/api/auth/test
   ```

2. **Teste a iniciação:**
   ```bash
   curl -v http://localhost:5000/api/auth/google
   ```

3. **Verifique os logs do servidor** durante o teste

### 7. Problemas Comuns

#### Erro: "redirect_uri_mismatch"
- **Causa**: URL de callback não está configurada no Google Console
- **Solução**: Adicionar `http://localhost:5000/api/auth/google/callback` nas URLs autorizadas

#### Erro: "invalid_client"
- **Causa**: Client ID ou Client Secret incorretos
- **Solução**: Verificar se as credenciais no .env estão corretas

#### Erro: "access_denied"
- **Causa**: Usuário cancelou a autorização
- **Solução**: Normal, usuário pode tentar novamente

### 8. URLs Importantes

**Desenvolvimento:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Callback: `http://localhost:5000/api/auth/google/callback`

**Produção:**
- Frontend: `https://lifebee.netlify.app`
- Backend: `https://lifebee-backend.onrender.com`
- Callback: `https://lifebee.netlify.app/api/auth/google/callback`

### 9. Próximos Passos

1. Verificar se todas as URLs estão configuradas no Google Console
2. Testar o fluxo completo no navegador
3. Verificar logs do servidor durante o teste
4. Se ainda não funcionar, verificar se há problemas de CORS ou rede 