# 🔧 Executar Migração - Adicionar Colunas Stripe

## 🎯 Problema Identificado

O banco de dados **NÃO tem as colunas do Stripe** na tabela `professionals`.

Por isso você via o erro:
```
Property 'stripeAccountId' does not exist
```

## ✅ Solução Implementada

### 1. Schema Atualizado ✅
Arquivo `server/schema.ts` - Adicionadas 6 colunas do Stripe:
- `stripeAccountId`
- `stripeAccountStatus`
- `stripeOnboardingCompleted`
- `stripeDetailsSubmitted`
- `stripeChargesEnabled`
- `stripePayoutsEnabled`

### 2. Migração SQL Criada ✅
Arquivo `migrations/add-stripe-columns-to-professionals.sql`

## 🚀 Como Executar a Migração

### Opção A: Usando psql (Recomendado)

1. **Abra um novo terminal** (não feche o servidor)

2. **Execute a migração:**

```bash
# Windows com PostgreSQL instalado localmente:
psql -U postgres -d lifebee -f migrations/add-stripe-columns-to-professionals.sql

# Ou se estiver usando outro usuário:
psql -U seu_usuario -d lifebee -f migrations/add-stripe-columns-to-professionals.sql
```

3. **Digite a senha do PostgreSQL** quando solicitado

4. **Você deve ver:**
```
ALTER TABLE
CREATE INDEX
COMMENT
...
```

### Opção B: Usando pgAdmin ou DBeaver

1. **Abra seu cliente PostgreSQL** (pgAdmin, DBeaver, etc)
2. **Conecte no banco `lifebee`**
3. **Abra o arquivo** `migrations/add-stripe-columns-to-professionals.sql`
4. **Execute o script SQL completo**

### Opção C: Copiar e Colar no Terminal do Banco

```sql
-- Copie e cole este comando no seu cliente SQL:

ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_professionals_stripe_account_id 
ON professionals(stripe_account_id);
```

## 🧪 Verificar se Funcionou

### 1. Consulta SQL para Verificar Colunas

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'professionals'
  AND column_name LIKE 'stripe%'
ORDER BY column_name;
```

**Resultado esperado:**
```
         column_name          | data_type | is_nullable | column_default
------------------------------+-----------+-------------+----------------
 stripe_account_id            | text      | YES         |
 stripe_account_status        | text      | YES         |
 stripe_charges_enabled       | boolean   | YES         | false
 stripe_details_submitted     | boolean   | YES         | false
 stripe_onboarding_completed  | boolean   | YES         | false
 stripe_payouts_enabled       | boolean   | YES         | false
(6 rows)
```

### 2. Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Depois iniciar novamente:
cd server
npm run dev
```

### 3. Testar Conectar Stripe

1. **Faça login como profissional**
2. **Acesse:** http://localhost:5173/provider-settings
3. **Clique em:** "Conectar Stripe"
4. **Agora deve funcionar!** (sem erro 503)

## 📋 Checklist

- [ ] Schema atualizado (server/schema.ts) ✅ FEITO
- [ ] Migração SQL criada ✅ FEITO
- [ ] Executei a migração SQL no banco
- [ ] Verifiquei que as colunas foram criadas
- [ ] Reiniciei o servidor
- [ ] Testei clicar em "Conectar Stripe"
- [ ] Funciona! 🎉

## 🔍 Solução de Problemas

### Problema: psql não encontrado

**Solução:** Instale PostgreSQL ou use pgAdmin/DBeaver

### Problema: Permission denied

**Solução:** Use o usuário correto do PostgreSQL:
```bash
psql -U postgres -d lifebee -f migrations/add-stripe-columns-to-professionals.sql
```

### Problema: Banco não existe

**Solução:** Verifique o nome do banco:
```bash
# Listar bancos:
psql -U postgres -l
```

## 🎯 Próximos Passos

Depois da migração funcionar:

1. ✅ Servidor rodando sem erros
2. ✅ Pode clicar em "Conectar Stripe"
3. ✅ Abre o formulário do Stripe
4. ✅ Completa o cadastro
5. ✅ Volta para /provider-settings?stripe_setup=success
6. ✅ Verifica a conta e redireciona para dashboard

## 📁 Arquivos Modificados

- ✅ `server/schema.ts` - Schema atualizado
- ✅ `migrations/add-stripe-columns-to-professionals.sql` - Migração criada

---

**Agora execute a migração SQL e me diga o resultado!** 🚀

