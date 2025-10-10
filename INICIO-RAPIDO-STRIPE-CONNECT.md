# ⚡ Início Rápido - Stripe Connect

## 🎯 Começar AGORA em 3 Passos

### 📍 PASSO 1: Ativar Stripe Connect (5 minutos)

1. Acesse: https://dashboard.stripe.com/connect
2. Clique em **"Get Started"**
3. Escolha: **Express**
4. Preencher informações do LifeBee
5. Copiar **Client ID** (começa com `ca_`)
6. Adicionar no `.env`:
   ```bash
   STRIPE_CONNECT_CLIENT_ID=ca_xxxxxxxxxxxxx
   ```

✅ **Pronto para começar!**

---

### 📍 PASSO 2: Rodar Migration (2 minutos)

```bash
# 1. Criar arquivo de migration
cat > migrations/0012_add_stripe_connect_fields.sql << 'EOF'
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(50) DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_connected_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_professionals_stripe_account 
ON professionals(stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_professionals_stripe_status 
ON professionals(stripe_account_status);
EOF

# 2. Rodar migration
psql $DATABASE_URL -f migrations/0012_add_stripe_connect_fields.sql

# 3. Verificar
psql $DATABASE_URL -c "\d professionals"
```

✅ **Banco de dados pronto!**

---

### 📍 PASSO 3: Seguir o Plano

Abra o arquivo: `PLANO-MIGRACAO-STRIPE-CONNECT.md`

Siga fase por fase, marcando os checkboxes ✅

---

## 📋 Ordem de Implementação

```
DIA 1 - MANHÃ (3-4 horas):
├─ Fase 1: Preparação ✓
├─ Fase 2: Database ✓
└─ Fase 3: Backend API (começar)

DIA 1 - TARDE (3-4 horas):
├─ Fase 3: Backend API (terminar)
└─ Fase 4: Frontend Onboarding

DIA 2 - MANHÃ (2-3 horas):
├─ Fase 5: Frontend Updates
└─ Fase 6: Testes (começar)

DIA 2 - TARDE (2-3 horas):
├─ Fase 6: Testes (terminar)
├─ Fase 7: Deploy
└─ Fase 8: Migração (começar)
```

---

## 🚀 Próxima Ação

**AGORA:**
1. Execute os Passos 1 e 2 acima (7 minutos)
2. Abra `PLANO-MIGRACAO-STRIPE-CONNECT.md`
3. Comece pela Fase 1.2 (backup e branch)

---

## 📞 Documentos de Apoio

1. **Plano Completo:** `PLANO-MIGRACAO-STRIPE-CONNECT.md`
2. **Documentação Técnica:** `SISTEMA-PSP-STRIPE-COMPLETO.md`
3. **Suporte Stripe:** https://stripe.com/docs/connect

---

## 💡 Dicas

- ✅ Marque os checkboxes no plano conforme avança
- ✅ Faça commit após cada fase completa
- ✅ Teste cada fase antes de avançar
- ✅ Não pule etapas (há dependências!)

---

**Boa sorte! Você vai conseguir! 🚀**

