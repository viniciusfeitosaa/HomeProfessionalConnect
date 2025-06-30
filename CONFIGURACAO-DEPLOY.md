# Configuração de Deploy - Netlify + Render + Neon

## Problemas Identificados e Soluções

### 1. Configuração do Render (Backend)

**Variáveis de Ambiente Necessárias no Render:**

1. Acesse o dashboard do Render
2. Vá para seu serviço `lifebee-backend`
3. Na seção "Environment", adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://seu-usuario:sua-senha@seu-host-neon:5432/seu-banco?sslmode=require
JWT_SECRET=sua-chave-secreta-jwt-aqui
NODE_ENV=production
```

**Para obter a DATABASE_URL do Neon:**
1. Acesse o dashboard do Neon
2. Vá para seu projeto
3. Clique em "Connection Details"
4. Copie a string de conexão PostgreSQL

### 2. Configuração do Netlify (Frontend)

**Variáveis de Ambiente no Netlify:**

1. Acesse o dashboard do Netlify
2. Vá para seu site
3. Em "Site settings" > "Environment variables", adicione:

```
VITE_API_URL=https://lifebee-backend.onrender.com
```

### 3. Verificação das Conexões

**Para testar se o backend está conectado ao Neon:**

1. Acesse: `https://lifebee-backend.onrender.com/api/health`
2. Deve retornar uma resposta de status

**Para testar se o frontend está conectado ao backend:**

1. Abra o console do navegador no seu app Netlify
2. Verifique se não há erros de CORS
3. Teste fazer login/registro

### 4. Troubleshooting

**Se o backend não conecta ao Neon:**
- Verifique se a DATABASE_URL está correta
- Confirme se o banco Neon está ativo
- Verifique os logs no Render

**Se o frontend não conecta ao backend:**
- Verifique se a URL do backend está correta
- Confirme se o CORS está configurado
- Verifique se o backend está rodando no Render

**Se há erros de CORS:**
- Adicione o domínio do Netlify na lista de origens permitidas no backend
- Verifique se o protocolo (http/https) está correto

### 5. URLs Atualizadas

- **Frontend:** https://seu-app.netlify.app
- **Backend:** https://lifebee-backend.onrender.com
- **Database:** Neon (configurado via DATABASE_URL)

### 6. Próximos Passos

1. Configure as variáveis de ambiente no Render
2. Faça um novo deploy do backend
3. Configure as variáveis de ambiente no Netlify
4. Faça um novo deploy do frontend
5. Teste as conexões

## Comandos Úteis

```bash
# Para fazer deploy do backend no Render
git add .
git commit -m "Update backend configuration"
git push

# Para fazer deploy do frontend no Netlify
cd client
npm run build
# O Netlify fará o deploy automaticamente
``` 