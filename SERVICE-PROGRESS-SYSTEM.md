# Sistema de Progresso de Serviços - LifeBee

## Visão Geral

Este sistema implementa o fluxo completo de gerenciamento de serviços desde a aceitação da proposta até a confirmação de conclusão pelo cliente, preparando a estrutura para futura implementação de pagamentos.

## Fluxo do Sistema

### 1. Cliente Aceita Proposta
- **Endpoint**: `PUT /api/service-offers/:id/accept`
- **Ação**: Cliente aceita uma proposta de profissional
- **Resultado**: 
  - Status da proposta muda para "accepted"
  - Serviço é atribuído ao profissional
  - Status do serviço muda para "assigned"
  - Registro de progresso é criado com status "accepted"
  - Preço final é definido como o proposto

### 2. Profissional Inicia Serviço
- **Endpoint**: `POST /api/service/:id/start`
- **Ação**: Profissional marca o serviço como iniciado
- **Resultado**:
  - Status do serviço muda para "in_progress"
  - Campo `serviceStartedAt` é preenchido
  - Progresso é atualizado para "started"

### 3. Profissional Conclui Serviço
- **Endpoint**: `POST /api/service/:id/complete`
- **Ação**: Profissional marca o serviço como concluído
- **Parâmetros**: `notes` (opcional) - observações sobre o serviço
- **Resultado**:
  - Status do serviço muda para "awaiting_confirmation"
  - Campo `serviceCompletedAt` é preenchido
  - Progresso é atualizado para "awaiting_confirmation"
  - Cliente recebe notificação para confirmar

### 4. Cliente Confirma Conclusão
- **Endpoint**: `POST /api/service/:id/confirm`
- **Ação**: Cliente confirma que o serviço foi concluído satisfatoriamente
- **Resultado**:
  - Status do serviço muda para "completed"
  - Campo `clientConfirmedAt` é preenchido
  - Progresso é atualizado para "confirmed"
  - **Sistema está pronto para liberar pagamento** (futura implementação)

## Estados do Serviço

| Status | Descrição | Ação Necessária |
|--------|-----------|-----------------|
| `open` | Solicitação aberta | Profissional fazer proposta |
| `assigned` | Profissional atribuído | Profissional iniciar serviço |
| `in_progress` | Serviço em andamento | Profissional concluir serviço |
| `awaiting_confirmation` | Aguardando confirmação | Cliente confirmar conclusão |
| `completed` | Serviço confirmado | Pagamento liberado (futuro) |
| `cancelled` | Serviço cancelado | - |

## Estados do Progresso

| Status | Descrição | Timestamp |
|--------|-----------|-----------|
| `accepted` | Proposta aceita | `created_at` |
| `started` | Serviço iniciado | `started_at` |
| `in_progress` | Em andamento | `started_at` |
| `completed` | Profissional concluiu | `completed_at` |
| `awaiting_confirmation` | Aguardando cliente | `completed_at` |
| `confirmed` | Cliente confirmou | `confirmed_at` |
| `payment_released` | Pagamento liberado | `payment_released_at` |

## Estrutura do Banco de Dados

### Tabela `service_requests` (Novos campos)
- `service_started_at`: Quando o profissional iniciou
- `service_completed_at`: Quando o profissional concluiu
- `client_confirmed_at`: Quando o cliente confirmou

### Tabela `service_offers` (Novo campo)
- `final_price`: Preço final acordado após aceitação

### Nova Tabela `service_progress`
- Rastreia todo o progresso do serviço
- Permite auditoria completa
- Prepara para sistema de pagamentos

## Endpoints da API

### Gerenciamento de Progresso
- `POST /api/service/:id/start` - Profissional inicia serviço
- `POST /api/service/:id/complete` - Profissional conclui serviço
- `POST /api/service/:id/confirm` - Cliente confirma conclusão
- `GET /api/service/:id/progress` - Consulta progresso do serviço

### Exemplo de Uso

```bash
# 1. Profissional inicia serviço
curl -X POST http://localhost:8080/api/service/123/start \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# 2. Profissional conclui serviço
curl -X POST http://localhost:8080/api/service/123/complete \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Serviço realizado com sucesso"}'

# 3. Cliente confirma conclusão
curl -X POST http://localhost:8080/api/service/123/confirm \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# 4. Consultar progresso
curl -X GET http://localhost:8080/api/service/123/progress \
  -H "Authorization: Bearer TOKEN"
```

## Notificações

O sistema envia notificações automáticas para:
- Profissionais quando há novas solicitações
- Cliente quando o serviço é concluído (aguardando confirmação)
- Cliente quando o pagamento é liberado (futuro)

## Próximos Passos

1. **Implementar sistema de pagamentos** após confirmação do cliente
2. **Adicionar avaliações** do serviço pelo cliente
3. **Implementar sistema de disputas** em caso de problemas
4. **Adicionar relatórios** de serviços realizados
5. **Implementar sistema de reembolso** se necessário

## Segurança

- Todas as rotas requerem autenticação
- Verificação de permissões por tipo de usuário
- Validação de propriedade do serviço
- Logs de auditoria para todas as ações

## Migração

Execute a migração para adicionar os novos campos:

```bash
# Aplicar migração
npm run db:migrate

# Verificar status
npm run db:studio
```

## Testes

Para testar o sistema:

1. Crie uma solicitação de serviço como cliente
2. Faça uma proposta como profissional
3. Aceite a proposta como cliente
4. Inicie o serviço como profissional
5. Conclua o serviço como profissional
6. Confirme a conclusão como cliente

O sistema estará pronto para implementação de pagamentos após a confirmação do cliente.
