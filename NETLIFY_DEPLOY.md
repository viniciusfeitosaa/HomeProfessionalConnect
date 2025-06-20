# Deploy do LifeBee Frontend no Netlify

## Resumo da Migração

Para migrar o frontend do LifeBee para o Netlify, você terá duas partes separadas:
- **Frontend**: Hospedado no Netlify (interface do usuário)
- **Backend**: Mantido no Replit (API e banco de dados)

## Arquivos Preparados

### ✅ Configurações criadas:
- `netlify.toml` - Configurações de build e redirecionamentos
- `vite.config.client.ts` - Build específico do frontend
- `client/index.html` - HTML otimizado com SEO
- Backend configurado com CORS para aceitar requisições do Netlify

## Processo de Deploy

### 1. Obter URL do Backend Replit
Primeiro, você precisa da URL do seu backend. No Replit:
1. Vá para a aba "Deployments"
2. Clique em "Deploy" para criar um deployment
3. Copie a URL gerada (algo como: `https://seu-projeto.replit.app`)

### 2. Configurar no Netlify

#### Build Settings:
- **Build command**: `vite build`
- **Publish directory**: `dist/public`
- **Node version**: 20

#### Variáveis de ambiente obrigatórias:
```
VITE_API_URL=https://sua-app.replit.app
```

### 3. Atualizar netlify.toml
Edite o arquivo `netlify.toml` e substitua:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://SUA-URL-REPLIT.replit.app/api/:splat"
```

### 4. Configurar CORS no Backend
No arquivo `server/index.ts`, atualize a linha:
```javascript
'https://lifebee.netlify.app', // Substitua pela sua URL do Netlify
```

## Comandos de Build

### Para desenvolvimento local:
```bash
npm run dev
```

### Para build do frontend apenas:
```bash
vite build
```

## Processo no Netlify

1. **Conectar repositório**: Conecte sua conta GitHub/GitLab ao Netlify
2. **Import project**: Selecione o repositório do LifeBee
3. **Configure build**:
   - Build command: `vite build`
   - Publish directory: `dist/public`
4. **Adicionar variáveis de ambiente**:
   - `VITE_API_URL=https://sua-app.replit.app`
5. **Deploy**: Clique em "Deploy site"

## Após o Deploy

### Testar funcionalidades:
- [ ] Login/registro de usuários
- [ ] Busca de profissionais
- [ ] Agendamento de consultas
- [ ] Sistema de mensagens
- [ ] Notificações

### URLs finais:
- Frontend: `https://seu-site.netlify.app`
- Backend: `https://sua-app.replit.app`

## Vantagens da Migração

1. **Performance**: Netlify oferece CDN global
2. **Escalabilidade**: Frontend separado do backend
3. **Deploy automático**: Atualizações automáticas via Git
4. **HTTPS gratuito**: SSL incluído
5. **Domínio personalizado**: Fácil configuração

## Custos

- **Netlify**: Gratuito para projetos pessoais
- **Replit**: Mantém o backend (plano atual)

Total: Sem custos adicionais para a migração