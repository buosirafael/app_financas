import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { DashboardSummary } from "@/types";

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const cards = [
    {
      label: "Receitas",
      value: summary.totalIncome,
      icon: TrendingUp,
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-950/60 border-emerald-900",
    },
    {
      label: "Despesas",
      value: summary.totalExpense,
      icon: TrendingDown,
      colorClass: "text-rose-400",
      bgClass: "bg-rose-950/60 border-rose-900",
    },
    {
      label: "Saldo",
      value: summary.balance,
      icon: Wallet,
      colorClass: summary.balance >= 0 ? "text-sky-400" : "text-rose-400",
      bgClass: "bg-sky-950/60 border-sky-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, value, icon: Icon, colorClass, bgClass }) => (
        <Card key={label} className={`border ${bgClass}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className={`p-1.5 rounded-md bg-card`}>
                <Icon className={`h-4 w-4 ${colorClass}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>
              {formatCurrency(value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
