import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { MonthSelector } from "@/components/dashboard/MonthSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentMonthYear } from "@/lib/utils";
import type { DashboardSummary, CategoryExpense, Transaction } from "@/types";

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

async function DashboardContent({ year, month }: { year: number; month: number }) {
  const supabase = await createClient();
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false });

  const all = (transactions as Transaction[]) ?? [];

  const totalIncome = all.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = all.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const summary: DashboardSummary = { totalIncome, totalExpense, balance: totalIncome - totalExpense };

  const expensesByCategory = all
    .filter((t) => t.type === "expense" && t.category)
    .reduce<Record<string, CategoryExpense>>((acc, t) => {
      const cat = t.category!;
      if (!acc[cat.id]) acc[cat.id] = { name: cat.name, value: 0, color: cat.color ?? "#94a3b8", icon: cat.icon ?? "📦" };
      acc[cat.id].value += t.amount;
      return acc;
    }, {});

  const chartData = Object.values(expensesByCategory).sort((a, b) => b.value - a.value);
  const recent = all.slice(0, 5);

  return (
    <div className="space-y-6">
      <SummaryCards summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={chartData} />
        <RecentTransactions transactions={recent} />
      </div>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const year = params.year ? Number(params.year) : currentYear;
  const month = params.month ? Number(params.month) : currentMonth;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Resumo financeiro do período</p>
        </div>
        <Suspense>
          <MonthSelector year={year} month={month} />
        </Suspense>
      </div>
      <Suspense fallback={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      }>
        <DashboardContent year={year} month={month} />
      </Suspense>
    </div>
  );
}
