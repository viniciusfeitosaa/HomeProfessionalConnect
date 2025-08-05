# 🔧 Variáveis de Ambiente para Render

## 📋 Variáveis Necessárias

Configure estas variáveis no dashboard do Render (Environment):

### 1. **GOOGLE_CLIENT_ID**
```
[SEU_GOOGLE_CLIENT_ID_AQUI]
```

### 2. **GOOGLE_CLIENT_SECRET**
```
[SEU_GOOGLE_CLIENT_SECRET_AQUI]
```

### 3. **JWT_SECRET**
```
[SEU_JWT_SECRET_AQUI]
```

### 4. **NODE_ENV**
```
production
```

### 5. **DATABASE_URL** (já configurado)
```
[SUA_DATABASE_URL_AQUI]
```

## 🚀 Como Configurar

1. **Acesse:** https://dashboard.render.com/
2. **Selecione** seu projeto "lifebee-backend"
3. **Vá em** "Environment"
4. **Clique em** "Add Environment Variable"
5. **Adicione** cada variável acima
6. **Clique em** "Save Changes"
7. **Vá em** "Manual Deploy" > "Deploy latest commit"

## ✅ Após Configurar

O deploy deve funcionar e você verá:
```
✅ Google OAuth habilitado - variáveis configuradas
✅ Database connection established successfully
🌐 Iniciando servidor...
```

## 🔗 URLs Importantes

- **Backend Render:** [SUA_URL_DO_RENDER]
- **Frontend Netlify:** https://lifebee.netlify.app/

---

**Status:** ⏳ Aguardando configuração das variáveis

## 🔒 Segurança

⚠️ **NUNCA** commite credenciais reais no Git!
- Use variáveis de ambiente
- Mantenha credenciais em arquivos `.env` (não commitados)
- Use templates como este para documentação 