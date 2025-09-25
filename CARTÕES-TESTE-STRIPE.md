# 💳 Cartões de Teste - Stripe

## 🧪 **Cartões para Teste (Modo Sandbox)**

### ✅ **Cartões que Funcionam (Pagamento Aprovado):**

| Número | Marca | CVV | Validade | Descrição |
|--------|-------|-----|----------|-----------|
| `4242 4242 4242 4242` | Visa | `123` | `12/25` | Cartão básico aprovado |
| `4000 0566 5566 5556` | Visa (Débito) | `123` | `12/25` | Cartão de débito |
| `5555 5555 5555 4444` | Mastercard | `123` | `12/25` | Mastercard aprovado |
| `2223 0031 2200 3222` | Mastercard (2-series) | `123` | `12/25` | Mastercard 2-series |
| `3782 822463 10005` | American Express | `1234` | `12/25` | Amex aprovado |
| `6011 1111 1111 1117` | Discover | `123` | `12/25` | Discover aprovado |

### ❌ **Cartões que Falham (Para Testar Erros):**

| Número | CVV | Validade | Erro |
|--------|-----|----------|------|
| `4000 0000 0000 0002` | `123` | `12/25` | Cartão recusado |
| `4000 0000 0000 9995` | `123` | `12/25` | Fundos insuficientes |
| `4000 0000 0000 0069` | `123` | `12/25` | Cartão expirado |
| `4000 0000 0000 0119` | `123` | `12/25` | Erro de processamento |

### 🔐 **3D Secure (Autenticação):**

| Número | CVV | Validade | Comportamento |
|--------|-----|----------|---------------|
| `4000 0025 0000 3155` | `123` | `12/25` | Requer autenticação 3D Secure |
| `4000 0027 6000 3184` | `123` | `12/25` | 3D Secure falha |

## 📱 **PIX (Pagamento Instantâneo)**

- **Como funciona:** Após selecionar PIX, o Stripe gera um QR Code
- **Teste:** Use qualquer CPF válido (ex: `123.456.789-00`)
- **Status:** Pagamento instantâneo (simulado)

## 🏦 **Boleto Bancário**

- **Como funciona:** Após selecionar Boleto, o Stripe gera um código de barras
- **Teste:** Use qualquer CPF válido
- **Status:** Pagamento em 1-3 dias úteis (simulado)

## 🧪 **Como Testar:**

### 1. **Teste Cartão Aprovado:**
```
Número: 4242 4242 4242 4242
CVV: 123
Validade: 12/25
Nome: João Silva
```

### 2. **Teste PIX:**
- Selecione aba "PIX"
- Preencha CPF: `123.456.789-00`
- Clique em "Pagar"
- Deve gerar QR Code (simulado)

### 3. **Teste Boleto:**
- Selecione aba "Boleto"
- Preencha CPF: `123.456.789-00`
- Clique em "Pagar"
- Deve gerar código de barras (simulado)

## ⚠️ **Importante:**

- ✅ **Modo Sandbox:** Todos os pagamentos são simulados
- ✅ **Sem cobrança real:** Nenhum valor é debitado
- ✅ **Teste seguro:** Use apenas em ambiente de desenvolvimento
- ❌ **Nunca use em produção:** Troque para chaves live quando for ao ar

## 🔧 **Configuração Atual:**

- **Chave Pública:** `pk_test_XXXXXXXXXXXX` (Teste)
- **Chave Secreta:** `sk_test_XXXXXXXXXXXX` (Teste)
- **Moeda:** BRL (Real Brasileiro)
- **Métodos:** Cartão, PIX, Boleto

## 🚀 **Próximos Passos:**

1. **Teste com cartões acima**
2. **Verifique se PIX e Boleto aparecem**
3. **Teste diferentes cenários de erro**
4. **Configure webhooks para produção**
