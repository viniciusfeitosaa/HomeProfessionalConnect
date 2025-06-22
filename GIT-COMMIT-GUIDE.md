# Comandos Git para Commit das Alterações

## Fazer commit das alterações da migração Netlify

Execute estes comandos no terminal:

```bash
# Adicionar todos os arquivos modificados
git add .

# Verificar o que será commitado
git status

# Fazer o commit com mensagem descritiva
git commit -m "feat: Configure Netlify frontend deployment

- Add complete client/ directory structure for independent frontend
- Configure Vite build system optimized for production
- Add API configuration for Replit backend connection
- Configure CORS for Netlify domain: spiffy-alpaca-35ad72.netlify.app
- Add comprehensive deployment documentation
- Include environment variable setup for API URL
- Create separate package.json and build configs for frontend"

# Enviar para o GitHub
git push origin main
```

## Arquivos que serão commitados:

### Novos arquivos criados:
- `netlify.toml` - Configuração de deploy Netlify
- `client/package.json` - Dependências do frontend
- `client/vite.config.ts` - Configuração Vite
- `client/tsconfig.json` - Configuração TypeScript
- `client/tsconfig.node.json` - Configuração Node TypeScript
- `client/index.html` - HTML principal
- `client/postcss.config.js` - Configuração PostCSS
- `client/tailwind.config.ts` - Configuração Tailwind
- `client/src/vite-env.d.ts` - Tipos TypeScript para Vite
- `client/src/lib/api-config.ts` - Configuração de API
- `client/.env.example` - Exemplo de variáveis de ambiente
- `README-NETLIFY.md` - Documentação completa
- `NETLIFY-SETUP.md` - Guia de configuração
- `GIT-COMMIT-GUIDE.md` - Este arquivo

### Arquivos modificados:
- `server/index.ts` - CORS configurado para Netlify
- `client/src/lib/queryClient.ts` - API URL dinâmica
- `replit.md` - Documentação atualizada

Execute os comandos acima no terminal para fazer o commit completo.