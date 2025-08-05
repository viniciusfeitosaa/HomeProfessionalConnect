# LifeBee Frontend - Deploy para Netlify

## Configuração Rápida

### 1. Conectar Repositório ao Netlify
1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub/GitLab
4. Selecione este repositório

### 2. Configurações de Build no Netlify
```
Base directory: client
Build command: npm run build
Publish directory: client/dist
```

### 3. Variáveis de Ambiente
No painel do Netlify, vá em Site settings > Environment variables e adicione:
```
VITE_API_URL = https://seu-app-replit.replit.app
```

### 4. Configurar Backend no Replit
No seu backend Replit, certifique-se de que está configurado para CORS:
```javascript
// No seu server/index.ts
app.use(cors({
  origin: ['https://seu-site.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

## Estrutura de Arquivos Criados

- `netlify.toml` - Configuração de deploy e redirects
- `client/package.json` - Dependências do frontend
- `client/vite.config.ts` - Configuração do Vite
- `client/tsconfig.json` - Configuração TypeScript
- `client/index.html` - HTML principal
- `client/.env.example` - Exemplo de variáveis de ambiente

## Comandos Locais

```bash
# Navegar para pasta do frontend
cd client

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Fazer build para produção
npm run build

# Preview do build
npm run preview
```

## URL da API
Substitua `https://your-replit-app.replit.app` pela URL real do seu backend Replit em:
- `netlify.toml` (linha 8)
- Variável de ambiente `VITE_API_URL` no Netlify
- `.env.example` para referência

## Deploy Automático
Após configurar, cada push para a branch principal irá automaticamente fazer deploy no Netlify.