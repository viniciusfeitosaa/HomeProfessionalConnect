# Debug do Google OAuth

## Problema Atual
O login com Google não está funcionando - após clicar no botão, volta para a tela de login.

## Verificações Necessárias

### 1. Google Console Configuration

**Acesse:** https://console.cloud.google.com/apis/credentials

**Verifique se as URLs de callback estão configuradas corretamente:**

Para desenvolvimento:
```
http://localhost:5000/api/auth/google/callback
```

Para produção:
```
https://lifebee.netlify.app/api/auth/google/callback
```

### 2. URLs Autorizadas

No Google Console, verifique também as "Authorized JavaScript origins":

Para desenvolvimento:
```
http://localhost:5173
http://localhost:5000
```

Para produção:
```
https://lifebee.netlify.app
```

### 3. Teste Manual do Fluxo

1. **Teste a iniciação:**
   ```bash
   curl -v http://localhost:5000/api/auth/google
   ```
   Deve redirecionar para Google login.

2. **Teste a configuração:**
   ```bash
   curl -v http://localhost:5000/api/auth/test
   ```
   Deve retornar configuração válida.

### 4. Logs do Servidor

Durante o teste, verifique os logs do servidor para:
- `🔐 Iniciando autenticação Google...`
- `🔐 Google OAuth callback iniciado`
- `👤 Usuário recebido:`
- `🎫 Token gerado com sucesso`
- `🔄 Redirecionando para:`

### 5. Possíveis Problemas

1. **URL de callback incorreta no Google Console**
2. **Domínio não autorizado no Google Console**
3. **Credenciais inválidas no .env**
4. **Problema de CORS**
5. **Token JWT inválido**

### 6. Próximos Passos

1. Verificar configuração no Google Console
2. Testar com credenciais corretas
3. Verificar logs do servidor durante o teste
4. Testar o fluxo completo no navegador

## Comandos de Teste

```bash
# Testar configuração
curl -v http://localhost:5000/api/auth/test

# Testar iniciação do OAuth
curl -v http://localhost:5000/api/auth/google

# Testar callback (com código válido do Google)
curl -v "http://localhost:5000/api/auth/google/callback?code=VALID_CODE&state=STATE"
``` 