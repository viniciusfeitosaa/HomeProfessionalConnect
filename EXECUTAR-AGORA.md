# ⚡ EXECUTE ESTES COMANDOS AGORA

## 🎯 Problema Encontrado
A tabela `professionals` não tem as colunas do Stripe no banco de dados!

## ✅ Solução (3 comandos simples)

### 1️⃣ Executar Migração SQL

**Abra um novo terminal PowerShell e execute:**

```powershell
# Navegar para o projeto
cd C:\LifeBee\HomeProfessionalConnect

# Executar migração
psql -U postgres -d lifebee -f migrations/add-stripe-columns-to-professionals.sql
```

**Digite a senha do PostgreSQL quando solicitado**

---

### 2️⃣ Reiniciar o Servidor

**No terminal onde o servidor está rodando:**

```bash
# Parar (Ctrl+C)
# Depois iniciar:
cd server
npm run dev
```

---

### 3️⃣ Testar

**No navegador:**

1. Acesse: http://localhost:5173/provider-settings
2. Clique em: "Conectar Stripe"
3. Deve funcionar! 🎉

---

## ❓ Não tem psql instalado?

### Opção Alternativa: Executar SQL Manualmente

1. **Abra pgAdmin ou DBeaver**
2. **Conecte no banco `lifebee`**
3. **Execute este SQL:**

```sql
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

4. **Reinicie o servidor**
5. **Teste!**

---

## 🎯 Resultado Esperado

Você deve ver no console da migração:
```
ALTER TABLE
CREATE INDEX
```

E ao testar "Conectar Stripe":
✅ Abre formulário do Stripe (não mais erro 503)

---

**Me diga o que aconteceu!** 🚀

