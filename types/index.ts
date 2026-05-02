export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category_id: string | null;
  date: string;
  created_at: string;
  category?: Category | null;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryExpense {
  name: string;
  value: number;
  color: string;
  icon: string;
}

export interface MonthFilter {
  year: number;
  month: number;
}
