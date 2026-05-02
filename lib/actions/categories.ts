"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return (data as Category[]) ?? [];
}

export async function createCategory(data: { name: string; icon: string; color: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("categories").insert({ ...data, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/categories");
  revalidatePath("/transactions");
}

export async function updateCategory(id: string, data: { name: string; icon: string; color: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/categories");
  revalidatePath("/transactions");
}
