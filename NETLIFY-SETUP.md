# LifeBee - Setup Completo para Netlify

## 🎯 CORS Configurado
✅ Backend já configurado para aceitar conexões de: `https://spiffy-alpaca-35ad72.netlify.app`

## 📋 Próximos Passos

### 1. No Netlify Dashboard
1. Acesse: https://app.netlify.com/sites/spiffy-alpaca-35ad72/settings/env
2. Adicione esta variável de ambiente:
   ```
   VITE_API_URL = https://SEU_REPLIT_URL.replit.app
   ```
   (Substitua `SEU_REPLIT_URL` pela URL real do seu projeto Replit)

### 2. Obter URL do Replit
1. No seu projeto Replit, clique no botão de deploy
2. Copie a URL que aparece (algo como: `https://nome-do-projeto.username.repl.co`)
3. Use essa URL na variável `VITE_API_URL` do Netlify

### 3. Configurações de Build (se necessário)
No Netlify, em Site Settings > Build & Deploy:
```
Base directory: client
Build command: npm run build
Publish directory: client/dist
```

### 4. Testar Conexão
Após configurar a variável de ambiente:
1. Faça redeploy do site no Netlify
2. Teste login/registro no frontend
3. Verifique se os dados carregam corretamente

## 🔍 Troubleshooting

**Se aparecer erro de CORS:**
- Verifique se a URL do Netlify está correta no backend
- Confirme que a variável `VITE_API_URL` está configurada

**Se a API não conectar:**
- Verifique se o Replit está rodando
- Confirme que a URL do Replit está correta
- Teste a API diretamente: `https://SEU_REPLIT_URL.replit.app/api/professionals`

## ✅ Status Atual
- ✅ CORS configurado no backend
- ✅ Frontend preparado para Netlify
- ⏳ Aguardando configuração da variável de ambiente
- ⏳ Aguardando URL do Replit