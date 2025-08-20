# Sistema de Avaliação de Serviços - LifeBee

## Visão Geral

O sistema de avaliação de serviços permite que os clientes avaliem os profissionais após a conclusão de um serviço, fornecendo feedback através de uma escala de 1 a 5 estrelas e comentários opcionais. Essas avaliações são automaticamente calculadas para atualizar a classificação média dos profissionais.

## Funcionalidades Principais

### 1. Popup de Avaliação
- **Trigger**: Aparece automaticamente após o cliente confirmar a conclusão do serviço
- **Interface**: Sistema de 5 estrelas interativo com hover effects
- **Campos**: 
  - Avaliação obrigatória (1-5 estrelas)
  - Comentário opcional
  - Botão de envio com loading state

### 2. Sistema de Estrelas
- **Escala**: 1 a 5 estrelas
- **Feedback Visual**: 
  - 1 estrela: "Péssimo"
  - 2 estrelas: "Ruim"
  - 3 estrelas: "Regular"
  - 4 estrelas: "Bom"
  - 5 estrelas: "Excelente"
- **Interatividade**: Hover effects e animações

### 3. Cálculo Automático de Avaliação
- **Média**: Calculada automaticamente baseada em todas as avaliações
- **Atualização**: Em tempo real após cada nova avaliação
- **Padrão**: 5.0 estrelas para profissionais sem avaliações

## Arquitetura Técnica

### Backend

#### 1. Nova Tabela: `service_reviews`
```sql
CREATE TABLE "service_reviews" (
  "id" serial PRIMARY KEY,
  "service_request_id" integer NOT NULL,
  "service_offer_id" integer NOT NULL,
  "client_id" integer NOT NULL,
  "professional_id" integer NOT NULL,
  "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
```

**Índices de Performance:**
- `professional_id` - Para buscar avaliações por profissional
- `client_id` - Para buscar avaliações por cliente
- `service_request_id` - Para buscar avaliação específica
- `rating` - Para análises estatísticas
- `created_at` - Para ordenação cronológica

**Constraints:**
- Avaliação única por serviço por cliente
- Foreign keys com CASCADE para integridade referencial
- Validação de rating entre 1-5

#### 2. Storage Layer (`server/storage.ts`)
```typescript
// Interface IStorage
createServiceReview(review: InsertServiceReview): Promise<ServiceReview>;
getServiceReviewsByProfessional(professionalId: number): Promise<ServiceReview[]>;
getServiceReviewsByClient(clientId: number): Promise<ServiceReview[]>;
getServiceReviewByService(serviceRequestId: number): Promise<ServiceReview | null>;
updateProfessionalRating(professionalId: number): Promise<void>;
```

**Implementações:**
- `createServiceReview`: Cria avaliação e atualiza rating do profissional
- `updateProfessionalRating`: Recalcula média e total de avaliações
- Validações de integridade e tratamento de erros

#### 3. API Routes (`server/routes.ts`)

**POST `/api/service/:id/review`**
- Validação de usuário (apenas clientes)
- Verificação de propriedade do serviço
- Validação de status (deve estar concluído)
- Prevenção de avaliações duplicadas
- Criação da avaliação no banco

**GET `/api/professional/:id/reviews`**
- Lista todas as avaliações de um profissional
- Dados públicos (sem autenticação necessária)
- Formatação para exibição

**Modificação da rota de confirmação:**
- Retorna `requiresReview: true` para trigger do popup
- Inclui `serviceRequestId` para referência

### Frontend

#### 1. Componente: `RatingPopup` (`client/src/components/rating-popup.tsx`)
```typescript
interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequestId: number;
  onRatingSubmitted: () => void;
}
```

**Características:**
- Modal responsivo com backdrop
- Sistema de estrelas interativo
- Validação de rating obrigatório
- Estados de loading e disabled
- Feedback visual com toast notifications

#### 2. Integração: `Services` (`client/src/pages/services.tsx`)
```typescript
// Estados para controle do popup
const [showRatingPopup, setShowRatingPopup] = useState(false);
const [serviceToRate, setServiceToRate] = useState<number | null>(null);

// Handlers
const handleRatingSubmitted = () => {
  fetchServiceOffers();
  fetchServiceRequests();
};

const handleCloseRatingPopup = () => {
  setShowRatingPopup(false);
  setServiceToRate(null);
};
```

**Fluxo de Integração:**
1. Cliente confirma conclusão do serviço
2. API retorna `requiresReview: true`
3. Popup de avaliação é exibido automaticamente
4. Após envio, dados são recarregados
5. Popup é fechado e estado é limpo

## Fluxo Completo do Sistema

### 1. Confirmação do Serviço
```
Cliente clica em "Confirmar Conclusão" 
→ API confirma serviço e libera pagamento
→ Retorna requiresReview: true
→ Frontend exibe popup de avaliação
```

### 2. Processo de Avaliação
```
Cliente seleciona rating (1-5 estrelas)
→ Opcionalmente adiciona comentário
→ Clica em "Enviar Avaliação"
→ API valida e salva avaliação
→ Atualiza rating médio do profissional
→ Frontend exibe confirmação
```

### 3. Atualização de Dados
```
Avaliação é salva no banco
→ Rating médio é recalculado
→ Total de avaliações é atualizado
→ Profissional recebe nova classificação
→ Frontend recarrega dados atualizados
```

## Validações e Segurança

### Backend
- **Autenticação**: Apenas usuários logados podem avaliar
- **Autorização**: Apenas o cliente do serviço pode avaliar
- **Status**: Serviço deve estar concluído
- **Unicidade**: Uma avaliação por serviço por cliente
- **Validação**: Rating entre 1-5 estrelas

### Frontend
- **Estado**: Controle de loading e disabled
- **Validação**: Rating obrigatório antes do envio
- **Feedback**: Toast notifications para sucesso/erro
- **UX**: Hover effects e animações responsivas

## Monitoramento e Logs

### Logs de Sistema
```typescript
console.log('✅ Criando avaliação de serviço:', review);
console.log(`✅ Avaliação do profissional ${professionalId} atualizada: ${averageRating.toFixed(1)} (${reviews.length} avaliações)`);
console.error('❌ Erro ao criar avaliação de serviço:', error);
```

### Métricas Disponíveis
- Total de avaliações por profissional
- Rating médio atualizado
- Histórico de avaliações
- Estatísticas de feedback

## Como Usar

### Para Clientes
1. **Confirmar Serviço**: Clique em "Confirmar Conclusão do Serviço"
2. **Avaliar**: O popup aparecerá automaticamente
3. **Selecionar Rating**: Clique nas estrelas (1-5)
4. **Adicionar Comentário**: Opcional, mas recomendado
5. **Enviar**: Clique em "Enviar Avaliação"

### Para Profissionais
- **Visualização**: Rating médio atualizado automaticamente
- **Histórico**: Todas as avaliações disponíveis via API
- **Dashboard**: Estatísticas integradas ao perfil

## Próximos Passos e Melhorias

### Funcionalidades Futuras
- **Notificações**: Alertar profissionais sobre novas avaliações
- **Respostas**: Profissionais podem responder às avaliações
- **Filtros**: Busca e ordenação de avaliações
- **Relatórios**: Análises estatísticas avançadas
- **Moderação**: Sistema de denúncias para avaliações inadequadas

### Otimizações Técnicas
- **Cache**: Implementar cache para ratings médios
- **Batch Updates**: Processar múltiplas avaliações em lote
- **Real-time**: WebSockets para atualizações em tempo real
- **Analytics**: Tracking de métricas de satisfação

## Arquivos Modificados

### Backend
- `server/schema.ts` - Nova tabela e tipos
- `server/storage.ts` - Métodos de avaliação
- `server/routes.ts` - Rotas de API
- `migrations/0002_add_service_reviews_table.sql` - Migração do banco

### Frontend
- `client/src/components/rating-popup.tsx` - Componente de avaliação
- `client/src/pages/services.tsx` - Integração do popup

### Documentação
- `SISTEMA-AVALIACAO-SERVICOS.md` - Este arquivo

## Conclusão

O sistema de avaliação de serviços foi implementado com foco na experiência do usuário, segurança e performance. Ele fornece feedback valioso para os profissionais e melhora a qualidade geral da plataforma LifeBee, criando um ambiente de confiança e transparência entre clientes e profissionais.
