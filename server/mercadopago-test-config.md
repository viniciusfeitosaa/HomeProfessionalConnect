# Configuração de Contas de Teste - Mercado Pago

## 🧪 Contas de Teste Recomendadas

Para evitar a verificação por email durante os testes, use estas contas específicas:

### Conta Vendedora (Recebedora)
- **Email**: test_user_123456@testuser.com
- **Senha**: qatest1234
- **Tipo**: Vendedor/Profissional

### Conta Compradora (Pagadora)
- **Email**: test_user_654321@testuser.com
- **Senha**: qatest1234
- **Tipo**: Comprador/Cliente

## 💳 Cartões de Teste

### Cartão Aprovado
- **Número**: 4509 9535 6623 3704
- **CVV**: 123
- **Data**: 11/25

### Cartão Pendente
- **Número**: 3711 8030 3257 522
- **CVV**: 1234
- **Data**: 11/25

### Cartão Rejeitado
- **Número**: 4000 0000 0000 0002
- **CVV**: 123
- **Data**: 11/25

## 🔧 Configurações no Código

### 1. Modo Sandbox
O sistema já está configurado para usar o ambiente de sandbox do Mercado Pago.

### 2. Email Genérico
No webhook, usamos um email genérico para contas de teste:
```typescript
payer: {
  name: 'Cliente Teste',
  email: 'teste@testuser.com'
}
```

### 3. Webhook Automático
O webhook processa pagamentos automaticamente sem depender do retorno do usuário.

## 🚀 Como Testar

1. **Use as contas de teste acima**
2. **Use os cartões de teste fornecidos**
3. **O sistema processará automaticamente via webhook**
4. **Não será necessário verificar código por email**

## ⚠️ Importante

- Estas contas são apenas para testes
- Não use dados reais de cartão
- O ambiente de sandbox é isolado da produção
- Todos os pagamentos são simulados
