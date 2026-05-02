"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getTransactions } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import type { Category, Transaction } from "@/types";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const page = Number(searchParams.get("page") ?? "1");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [cats, result] = await Promise.all([
        getCategories(),
        getTransactions({
          year: searchParams.get("year") ? Number(searchParams.get("year")) : undefined,
          month: searchParams.get("month") ? Number(searchParams.get("month")) : undefined,
          type: (searchParams.get("type") as "income" | "expense" | "all") ?? "all",
          category_id: searchParams.get("category") ?? undefined,
          page,
        }),
      ]);
      setCategories(cats);
      setTransactions(result.transactions);
      setTotal(result.total);
      setLoading(false);
    }
    load();
  }, [searchParams, page]);

  function handlePageChange(newPage: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(newPage));
    window.history.pushState(null, "", `?${p.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transações</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Gerencie suas receitas e despesas</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova transação</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      <TransactionFilters categories={categories} />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          categories={categories}
          total={total}
          page={page}
          onPageChange={handlePageChange}
        />
      )}

      <TransactionForm
        open={showForm}
        onClose={() => { setShowForm(false); }}
        categories={categories}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsContent />
    </Suspense>
  );
}
