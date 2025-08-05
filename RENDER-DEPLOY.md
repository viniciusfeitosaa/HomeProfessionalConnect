# Deploy no Render - LifeBee Backend

## 🚀 Configuração do Deploy

### 1. Criar Novo Serviço Web

1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Selecione o repositório `HomeProfessionalConnect`

### 2. Configurações do Serviço

**Nome:** `lifebee-backend`
**Environment:** `Node`
**Region:** `Oregon (US West)` (ou mais próxima)
**Branch:** `main`
**Root Directory:** `server`
**Build Command:** `npm install && npm run build:render`
**Start Command:** `npm start`

### 3. Variáveis de Ambiente

Configure as seguintes variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `DATABASE_URL` | `postgresql://...` | URL do banco Neon |
| `JWT_SECRET` | `sua-chave-secreta-aqui` | Chave JWT (mínimo 32 chars) |
| `GOOGLE_CLIENT_ID` | `seu-google-client-id` | OAuth Google (opcional) |
| `GOOGLE_CLIENT_SECRET` | `seu-google-client-secret` | OAuth Google (opcional) |

### 4. Configuração do Banco de Dados

1. Crie um banco PostgreSQL no Neon
2. Execute as migrações do Drizzle
3. Configure a `DATABASE_URL` no Render

### 5. Problemas Comuns e Soluções

#### Erro: "Could not find a declaration file for module"

**Solução:** Os tipos TypeScript já estão incluídos no `package.json`. O build deve funcionar automaticamente.

#### Erro: "Cannot find module '@shared/schema'"

**Solução:** O `tsconfig.render.json` está configurado para resolver o módulo compartilhado.

#### Erro: "Module resolution failed"

**Solução:** Verifique se o `rootDir` está configurado corretamente no `tsconfig.render.json`.

### 6. Verificação do Deploy

Após o deploy, verifique:

1. **Logs do Build:** Devem mostrar "Build concluído com sucesso"
2. **Logs do Servidor:** Devem mostrar "Server running on port 10000"
3. **Health Check:** Acesse `https://seu-app.onrender.com/api/professionals`

### 7. URLs Importantes

- **API Base:** `https://seu-app.onrender.com`
- **Profissionais:** `https://seu-app.onrender.com/api/professionals`
- **Health Check:** `https://seu-app.onrender.com/api/health`

### 8. Monitoramento

- Configure alertas no Render para downtime
- Monitore os logs regularmente
- Verifique o uso de recursos

## 🔧 Troubleshooting

### Build Falha

1. Verifique os logs do build
2. Confirme que todas as dependências estão no `package.json`
3. Teste localmente com `npm run build:render`

### Servidor Não Inicia

1. Verifique se a `DATABASE_URL` está correta
2. Confirme que o `JWT_SECRET` está definido
3. Verifique os logs de erro

### Erros de CORS

1. Configure as origens permitidas no `index.ts`
2. Adicione o domínio do frontend na lista de CORS

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Render Dashboard
2. Teste localmente primeiro
3. Consulte a documentação do Render
4. Abra uma issue no GitHub 