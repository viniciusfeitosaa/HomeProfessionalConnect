# ⚡ Executar Migração - Dias e Diária

## 🎯 Execute AGORA no Neon SQL Editor

Acesse: https://console.neon.tech/ → SQL Editor

**Cole e execute:**

```sql
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS number_of_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(8,2);
```

---

## ✅ Verificar se Funcionou

Após executar, rode:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'service_requests'
  AND column_name IN ('number_of_days', 'daily_rate')
ORDER BY column_name;
```

**Deve retornar:**
```
daily_rate      | numeric
number_of_days  | integer
```

---

## 🧪 Testar Depois

1. **Recarregue** a página `/servico`
2. **Preencha:**
   - Quantidade de dias: 5
   - Valor por dia: R$ 150,00
3. **Veja:** Total calculado automaticamente: R$ 750,00
4. **Envie** a solicitação
5. **Verifique** se foi salva no banco

---

**Execute a migração SQL e teste!** 🚀

