-- ============================================================
-- SCHEMA: Finanças Pessoais
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE,
  name        text NOT NULL,
  icon        text DEFAULT '📦',
  color       text DEFAULT '#94a3b8',
  created_at  timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type        text CHECK (type IN ('income', 'expense')) NOT NULL,
  amount      numeric(12,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  date        date NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Categories: own + system (user_id IS NULL)
CREATE POLICY "categories_select" ON categories
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "categories_insert" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_update" ON categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "categories_delete" ON categories
  FOR DELETE USING (user_id = auth.uid());

-- Transactions: own only
CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "transactions_delete" ON transactions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- SEED: Default categories (user_id = NULL = system)
-- ============================================================

INSERT INTO categories (id, user_id, name, icon, color) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'Alimentação', '🍕', '#f59e0b'),
  ('00000000-0000-0000-0000-000000000002', NULL, 'Moradia',     '🏠', '#3b82f6'),
  ('00000000-0000-0000-0000-000000000003', NULL, 'Transporte',  '🚗', '#8b5cf6'),
  ('00000000-0000-0000-0000-000000000004', NULL, 'Saúde',       '💊', '#ec4899'),
  ('00000000-0000-0000-0000-000000000005', NULL, 'Lazer',       '🎮', '#06b6d4'),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Educação',    '📚', '#10b981'),
  ('00000000-0000-0000-0000-000000000007', NULL, 'Salário',     '💼', '#34d399'),
  ('00000000-0000-0000-0000-000000000008', NULL, 'Outros',      '📦', '#94a3b8')
ON CONFLICT (id) DO NOTHING;
