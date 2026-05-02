import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { Transaction } from "@/types";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Últimas transações</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-primary gap-1 h-7 px-2">
          <Link href="/transactions">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-0">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma transação no período</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-base">
                  {t.category?.icon ?? (t.type === "income" ? "💰" : "💸")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold tabular-nums shrink-0 ml-3 ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
