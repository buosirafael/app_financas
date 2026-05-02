"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Transaction } from "@/types";

export interface TransactionFilters {
  year?: number;
  month?: number;
  type?: "income" | "expense" | "all";
  category_id?: string;
  page?: number;
  pageSize?: number;
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const supabase = await createClient();
  const { year, month, type, category_id, page = 1, pageSize = 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("transactions")
    .select("*, category:categories(*)", { count: "exact" })
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (year && month) {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = new Date(year, month, 0).toISOString().split("T")[0];
    query = query.gte("date", start).lte("date", end);
  }
  if (type && type !== "all") query = query.eq("type", type);
  if (category_id) query = query.eq("category_id", category_id);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { transactions: (data as Transaction[]) ?? [], total: count ?? 0 };
}

export async function createTransaction(data: {
  type: "income" | "expense";
  amount: number;
  description: string;
  category_id: string | null;
  date: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("transactions").insert({ ...data, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function updateTransaction(
  id: string,
  data: {
    type: "income" | "expense";
    amount: number;
    description: string;
    category_id: string | null;
    date: string;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/transactions");
}
