# 🐝 LifeBee - Conectando Pessoas com Profissionais de Saúde

## 📱 Sobre o Projeto

LifeBee é uma plataforma que conecta pessoas com profissionais de saúde qualificados. O app permite encontrar médicos, enfermeiros, fisioterapeutas, cuidadores e acompanhantes hospitalares perto de você, com agendamento fácil e seguro.

## ✨ Funcionalidades

- 🔐 **Autenticação Completa**
  - Login/Registro tradicional
  - Login com Google (dados completos do perfil)
  - Validações robustas de email, telefone e senha

- 👥 **Sistema de Usuários**
  - Clientes podem buscar profissionais
  - Profissionais podem se cadastrar e oferecer serviços
  - Perfis completos com foto, especialização e avaliações

- 🔍 **Busca e Filtros**
  - Busca por localização
  - Filtros por categoria e especialização
  - Sistema de avaliações e reviews

- 📅 **Agendamento**
  - Sistema de agendamento de consultas
  - Chat entre cliente e profissional
  - Notificações de status

- 📱 **Interface Moderna**
  - Design responsivo para mobile e desktop
  - Tema escuro/claro
  - Navegação intuitiva

## 🚀 Status do Deploy

### ✅ **PRONTO PARA PRODUÇÃO**

- **Frontend:** https://lifebee.netlify.app/
- **Backend:** https://home-professional-connect-viniciusalves36.replit.app
- **Database:** PostgreSQL (Neon)

### 🔧 **Tecnologias Utilizadas**

**Frontend:**
- React + TypeScript
- Vite (build tool)
- Tailwind CSS
- Shadcn UI Components
- Wouter (routing)

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL (Drizzle ORM)
- Passport.js (OAuth)
- JWT Authentication

**Deploy:**
- **Frontend:** Netlify
- **Backend:** Replit
- **Database:** Neon (PostgreSQL)

## 📋 Como Fazer Deploy

### 1. **Configurar Variáveis no Netlify**
```
VITE_API_URL = https://home-professional-connect-viniciusalves36.replit.app
```

### 2. **Configurar Google OAuth**
1. Acesse Google Cloud Console
2. Adicione redirect URI: `https://lifebee.netlify.app/auth-callback`
3. Adicione test users se necessário

### 3. **Fazer Deploy**
1. Push para o repositório
2. Netlify fará deploy automático
3. Teste todas as funcionalidades

## 🧪 Testes Pós-Deploy

- [ ] Login tradicional funcionando
- [ ] Login com Google funcionando
- [ ] Busca de profissionais
- [ ] Compartilhamento social
- [ ] Responsividade mobile

## 📊 Compartilhamento Social

O app está configurado com meta tags otimizadas para:
- Facebook/LinkedIn (Open Graph)
- Twitter Cards
- WhatsApp/Telegram
- SEO básico

## 🔗 Links Úteis

- **App Online:** https://lifebee.netlify.app/
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Inspector:** https://www.linkedin.com/post-inspector/

## 📝 Documentação

- `DEPLOY-FINAL.md` - Guia completo de deploy
- `CONFIGURACAO-COMPARTILHAMENTO.md` - Configuração de compartilhamento social
- `OAUTH-SETUP.md` - Configuração do Google OAuth

---

**Status:** 🚀 **PRONTO PARA PRODUÇÃO**
**Última atualização:** Janeiro 2025 