# DiretorIA — Monorepo

SaaS de consultoria inteligente com IA para Marketing, Vendas, Receita e Estratégia de Negócios.

## Estrutura do Monorepo

```
DiretorIA/
├── backend/        Express + Prisma + Gemini API
├── frontend/       React + Vite + Tailwind + shadcn/ui
├── package.json    Root — scripts para rodar tudo junto
└── CLAUDE.md
```

## Como Rodar

```bash
# 1. Clone e entre na raiz
cd DiretorIA

# 2. Configure o backend
cp backend/.env.example backend/.env
# Edite backend/.env com: DATABASE_URL, JWT_SECRET, GEMINI_API_KEY

# 3. Crie as tabelas no banco (Supabase ou PostgreSQL local)
npm --prefix backend run prisma:push

# 4. (Opcional) Dados de demonstração
npm --prefix backend run prisma:seed

# 5. Instale todas as dependências
npm run setup

# 6. Rode o sistema completo
npm start
```

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:8080`

## Backend (`/backend`)

### Stack
- Node.js 20 + TypeScript + Express
- Prisma 5 + PostgreSQL (Supabase)
- JWT (HS256) + bcrypt
- Google Gemini API (`@google/generative-ai`)
- Winston (logs) + Zod (validação) + express-rate-limit

### Arquitetura — Clean Architecture modular

```
backend/src/
├── config/          env.ts (Zod validation), database.ts (Prisma singleton)
├── integrations/
│   └── llm/         gemini.client.ts, prompt.builder.ts
├── middlewares/     auth, error, rate-limit
├── modules/
│   ├── auth/        register + login → JWT
│   ├── company/     CRUD do contexto da empresa
│   ├── chat/        getOrCreate por tipo
│   └── message/     send (IA) + list histórico
└── shared/          AppError, logger, AuthenticatedRequest
```

### Endpoints

```
POST   /auth/register
POST   /auth/login

GET    /companies
POST   /companies
GET    /companies/:id
PUT    /companies/:id

GET    /chats
POST   /chats          { companyId, type }

POST   /messages/send  { chatId, content }
GET    /messages/:chatId
```

### Lógica da IA

1. `POST /messages/send` → busca empresa + histórico (últimas 20 msgs)
2. `prompt.builder.ts` monta system prompt: persona do consultor + área + contexto da empresa
3. `gemini.client.ts` envia histórico formatado (user/model, sem system)
4. Resposta salva como `assistant` e retornada

### Modelos

| Modelo    | Campos principais                                                     |
|-----------|-----------------------------------------------------------------------|
| `User`    | id, email, password_hash                                              |
| `Company` | id, user_id, name, description, market, icp, value_proposition, …    |
| `Chat`    | id, user_id, company_id, type (marketing/sales/revenue/business)      |
| `Message` | id, chat_id, role (user/assistant/system), content                    |

Chat tem unique constraint `(userId, companyId, type)` — idempotente por área.

### Variáveis de Ambiente

| Variável            | Descrição                               |
|---------------------|-----------------------------------------|
| `DATABASE_URL`      | PostgreSQL connection string (Supabase) |
| `JWT_SECRET`        | Mínimo 32 caracteres                    |
| `JWT_EXPIRES_IN`    | Ex: `7d`                                |
| `GEMINI_API_KEY`    | API key do Google AI Studio             |
| `GEMINI_MODEL`      | Padrão: `gemini-1.5-flash`              |
| `RATE_LIMIT_AI_MAX` | Max requests à IA por janela (padrão 30)|

## Frontend (`/frontend`)

### Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- react-markdown (renderização das respostas da IA)
- Roteamento: react-router-dom

### Arquitetura

```
frontend/src/
├── lib/
│   ├── api.ts             Cliente HTTP para o backend (fetch com proxy Vite)
│   ├── auth-context.tsx   AuthContext — JWT no localStorage
│   └── diretoria-data.ts  Tipos, AREAS, mapeamentos AreaId ↔ ChatType
├── pages/
│   ├── Auth.tsx           Login / Registro
│   └── Index.tsx          App principal (chat + histórico)
└── components/diretoria/
    ├── TopBar.tsx         Navegação por área + logout
    ├── Sidebar.tsx        Histórico de conversas
    ├── MessageBubble.tsx  Mensagens com markdown + loading dots
    ├── Composer.tsx       Input de texto com estado disabled
    └── ContextDrawer.tsx  Formulário de contexto da empresa (salva na API)
```

### Mapeamento de Áreas

| Frontend (`AreaId`) | Backend (`ChatType`) |
|---------------------|----------------------|
| `estrategia`        | `business`           |
| `marketing`         | `marketing`          |
| `vendas`            | `sales`              |
| `receita`           | `revenue`            |

### Proxy Vite

Todas as chamadas da UI vão para `/api/*`, e o Vite redireciona para `http://localhost:3000` removendo o prefixo `/api`. Não há CORS em desenvolvimento.

### Fluxo de Autenticação

1. JWT armazenado em `localStorage` (`diretoria_token`)
2. `AuthProvider` expõe `token`, `user`, `login`, `register`, `logout`
3. `ProtectedRoute` redireciona `/auth` se não autenticado
4. Em 401, o cliente limpa o token e redireciona automaticamente

### Contexto da Empresa (ContextDrawer → API)

O formulário tem 8 campos que mapeiam para os campos do backend:

| Frontend          | Backend              |
|-------------------|----------------------|
| `name`            | `name`               |
| `industry`        | `market`             |
| `stage` + `size`  | `description`        |
| `offer`           | `valueProposition`   |
| `icp`             | `icp`                |
| `goals`           | `benefits`           |
| `channels`        | `targetAudience`     |

## Convenções

- **Backend**: `controller → service → repository`. Controllers só fazem parse + delegam. Repositories são a única camada que toca Prisma.
- **Frontend**: chamadas à API apenas em `Index.tsx`. Componentes são puros (não conhecem a API).
- **Erros**: `AppError` no backend, `toast` (sonner) no frontend.
- **Mensagens otimistas**: user message adicionada ao thread antes da resposta da IA. Loading indicator com 3 dots animados.

## Scripts Disponíveis

```bash
# Raiz
npm start          # Inicia backend + frontend em paralelo
npm run setup      # Instala deps de backend e frontend
npm run build      # Build de produção dos dois

# Backend (npm --prefix backend run ...)
dev                # nodemon + ts-node
prisma:push        # Cria/atualiza schema no banco
prisma:seed        # Cria dados de demo (demo@diretoria.ai / password123)
prisma:studio      # Abre Prisma Studio

# Frontend (npm --prefix frontend run ...)
dev                # Vite dev server (porta 8080)
build              # Build de produção
```
