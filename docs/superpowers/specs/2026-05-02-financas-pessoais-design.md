# Design Spec: App de Finanças Pessoais

**Data:** 2026-05-02
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Recharts · Vercel

---

## 1. Visão Geral

Web app de gestão financeira pessoal. O usuário autentica via Supabase Auth, registra receitas e despesas categorizadas, e acompanha um dashboard com resumo mensal, gráfico de categorias e lista de transações recentes. Cada usuário vê apenas seus próprios dados (Row Level Security).

---

## 2. Decisões de Design

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Navegação | Sidebar lateral (drawer hambúrguer no mobile) | Melhor aproveitamento de tela no desktop; padrão familiar |
| Paleta | Dark mode — fundo `#0f172a`, acento azul-celeste `#38bdf8` | Visual premium fintech, reduz fadiga visual |
| Dashboard | Clássico: 3 cards + gráfico de pizza + recentes | Informação completa em uma tela só |
| Categorias | Híbrido: padrão do sistema + customizáveis por usuário | Onboarding rápido sem sacrificar flexibilidade |
| Arquitetura | Server Components + Server Actions | Padrão oficial Next.js 14+, menos boilerplate, SSR nativo |

---

## 3. Arquitetura

### Estrutura de Pastas

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx          ← Sidebar + Header
│   ├── page.tsx            ← Dashboard principal
│   ├── transactions/
│   │   └── page.tsx
│   └── categories/
│       └── page.tsx
└── layout.tsx              ← Root layout (providers, fonts)

components/
├── ui/                     ← shadcn/ui (gerados via CLI)
├── dashboard/
│   ├── SummaryCards.tsx
│   ├── CategoryChart.tsx   ← Recharts PieChart
│   └── RecentTransactions.tsx
├── transactions/
│   ├── TransactionTable.tsx
│   ├── TransactionForm.tsx ← Sheet lateral
│   └── TransactionFilters.tsx
└── layout/
    ├── Sidebar.tsx
    ├── Header.tsx
    └── MobileDrawer.tsx

lib/
├── supabase/
│   ├── client.ts           ← createBrowserClient
│   ├── server.ts           ← createServerClient (cookies)
│   └── middleware.ts
└── actions/
    ├── transactions.ts     ← Server Actions CRUD
    └── categories.ts       ← Server Actions CRUD

types/
└── index.ts                ← Transaction, Category, DashboardSummary
```

### Fluxo de Dados

```
Request → middleware (valida sessão) → Server Component (busca Supabase)
       → renderiza HTML → Client Components (interatividade)
       → Server Action (mutação) → revalidatePath → re-render
```

---

## 4. Modelo de Dados

```sql
-- Categorias (híbrido: padrão do sistema + custom por usuário)
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users,   -- NULL = padrão do sistema
  name        text NOT NULL,
  icon        text,                          -- emoji
  color       text,                          -- hex para gráficos
  created_at  timestamptz DEFAULT now()
);

-- Transações
CREATE TABLE transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  type        text CHECK (type IN ('income', 'expense')) NOT NULL,
  amount      numeric(12,2) NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id),
  date        date NOT NULL,
  created_at  timestamptz DEFAULT now()
);
```

### RLS Policies

```sql
-- Transactions: usuário vê apenas as suas
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own transactions" ON transactions
  USING (user_id = auth.uid());

-- Categories: vê as suas + as padrão do sistema
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or system categories" ON categories
  USING (user_id = auth.uid() OR user_id IS NULL);
```

### Seed — Categorias Padrão

| Nome | Ícone | Cor |
|------|-------|-----|
| Alimentação | 🍕 | `#f59e0b` |
| Moradia | 🏠 | `#3b82f6` |
| Transporte | 🚗 | `#8b5cf6` |
| Saúde | 💊 | `#ec4899` |
| Lazer | 🎮 | `#06b6d4` |
| Educação | 📚 | `#10b981` |
| Salário | 💼 | `#34d399` |
| Outros | 📦 | `#94a3b8` |

---

## 5. Páginas

### `/login` e `/register`
- Formulários de autenticação com Supabase Auth (email/senha)
- Redirect para `/` se já autenticado
- Validação client-side com react-hook-form + zod

### `/` — Dashboard
- Seletor de mês no header (padrão: mês atual)
- **Card Receitas:** soma de `income` do período, verde
- **Card Despesas:** soma de `expense` do período, vermelho
- **Card Saldo:** receitas − despesas, azul-celeste
- **Gráfico de pizza (Recharts):** despesas agrupadas por categoria com legenda
- **Lista recentes:** últimas 5 transações com valor, categoria e data

### `/transactions` — Transações
- Tabela paginada (20 por página) com colunas: data, descrição, categoria, tipo, valor
- Filtros: mês/ano, tipo (receita/despesa/todos), categoria
- Botão "Nova transação" → abre `Sheet` com `TransactionForm`
- Ações por linha: editar (Sheet preenchido) e excluir (AlertDialog de confirmação)

### `/categories` — Categorias
- Grid de cards com todas as categorias visíveis (padrão + próprias)
- Categorias padrão: somente leitura, badge "Padrão"
- Formulário inline para criar categoria (nome + emoji + cor via color picker)
- Editar e excluir apenas categorias próprias

### Middleware
- Protege todas as rotas `/(dashboard)/*`
- Redireciona para `/login` se sessão inválida
- Atualiza cookie de sessão em cada request

---

## 6. Componentes Principais

| Componente | Tipo | Responsabilidade |
|-----------|------|-----------------|
| `Sidebar` | Client | Navegação, estado collapsed/expanded, link ativo |
| `MobileDrawer` | Client | Sheet lateral no mobile com mesmo conteúdo da Sidebar |
| `SummaryCards` | Server | Recebe dados pré-calculados, renderiza 3 cards |
| `CategoryChart` | Client | Recharts PieChart (requer `"use client"`) |
| `RecentTransactions` | Server | Lista simples das últimas transações |
| `TransactionTable` | Client | Tabela com sort, paginação e ações |
| `TransactionForm` | Client | react-hook-form + zod, chama Server Action no submit |
| `TransactionFilters` | Client | Atualiza URL search params para filtrar |

---

## 7. Milestones

| # | Milestone | Entrega |
|---|-----------|---------|
| 1 | **Setup** | Next.js + Tailwind + shadcn/ui + Supabase + Vercel configurados |
| 2 | **Auth** | Login, registro, logout, middleware de proteção |
| 3 | **Banco de dados** | Tabelas, RLS, seed de categorias padrão |
| 4 | **Transações CRUD** | Criar, listar, editar e excluir com Server Actions |
| 5 | **Dashboard** | Cards de resumo, gráfico Recharts, lista recentes, filtro de mês |
| 6 | **Filtros avançados** | Filtro por período, tipo e categoria em `/transactions` |
| 7 | **Categorias** | CRUD de categorias customizadas |
| 8 | **Polish** | Dark mode completo, responsividade mobile, skeletons, empty states |

---

## 8. Decisões Técnicas

- **`@supabase/ssr`** para `createServerClient` e `createBrowserClient` (pacote oficial para Next.js App Router)
- **`react-hook-form` + `zod`** para validação de formulários
- **`revalidatePath`** após Server Actions para sincronizar cache
- **`next/navigation` `useSearchParams`** para filtros sem perder estado na URL
- **Recharts** `PieChart` com `ResponsiveContainer` para responsividade do gráfico
- **shadcn/ui** components: Button, Input, Card, Sheet, Table, Dialog, Select, Badge, Skeleton
