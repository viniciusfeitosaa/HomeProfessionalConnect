# LifeBee Backend

Backend da aplicação LifeBee para conectar clientes com profissionais de saúde.

## Deploy no Render

### 1. Configuração das Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Render:

- `DATABASE_URL`: URL do banco PostgreSQL (Neon recomendado)
- `JWT_SECRET`: Chave secreta para JWT (mínimo 32 caracteres)
- `GOOGLE_CLIENT_ID`: ID do cliente Google OAuth (opcional)
- `GOOGLE_CLIENT_SECRET`: Secret do cliente Google OAuth (opcional)
- `NODE_ENV`: production

### 2. Configuração do Build

O Render deve usar as seguintes configurações:

- **Build Command**: `cd server && npm install && npm run build`
- **Start Command**: `cd server && npm start`
- **Environment**: Node.js

### 3. Estrutura do Projeto

```
server/
├── dist/           # Arquivos compilados
├── src/            # Código fonte
├── package.json    # Dependências
├── tsconfig.json   # Configuração TypeScript
└── README.md       # Este arquivo
```

### 4. Comandos Disponíveis

- `npm run build`: Compila o TypeScript
- `npm start`: Inicia o servidor em produção
- `npm run dev`: Inicia o servidor em desenvolvimento

### 5. Problemas Comuns

Se você encontrar erros de tipos TypeScript, certifique-se de que todas as dependências de tipos estão instaladas:

```bash
npm install --save-dev @types/express @types/passport @types/jsonwebtoken @types/bcryptjs @types/ws @types/express-session
```

### 6. Banco de Dados

O projeto usa Drizzle ORM com PostgreSQL. Certifique-se de que o banco está configurado e as tabelas foram criadas antes do deploy. 