"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteTransaction } from "@/lib/actions/transactions";
import { toast } from "@/lib/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TransactionForm } from "./TransactionForm";
import { Pencil, Trash2 } from "lucide-react";
import type { Category, Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE = 20;

export function TransactionTable({ transactions, categories, total, page, onPageChange }: Props) {
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      toast({ title: "Transação excluída" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <p className="text-lg">Nenhuma transação encontrada</p>
        <p className="text-sm">Adicione sua primeira transação usando o botão acima.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Descrição</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Tipo</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Valor</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{t.description}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {t.category ? (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span>{t.category.icon}</span>
                        <span>{t.category.name}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={t.type === "income" ? "income" : "expense"}>
                      {t.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold tabular-nums ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditTarget(t)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A transação &quot;{t.description}&quot; será removida permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(t.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">{total} transações</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Anterior
            </Button>
            <span className="flex items-center px-2 text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      )}

      <TransactionForm
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        categories={categories}
        transaction={editTarget}
      />
    </>
  );
}
