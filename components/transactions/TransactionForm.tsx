"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import { toast } from "@/lib/hooks/use-toast";
import type { Category, Transaction } from "@/types";
import { Loader2 } from "lucide-react";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  description: z.string().min(1, "Descrição obrigatória"),
  category_id: z.string().nullable().optional(),
  date: z.string().min(1, "Data obrigatória"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  transaction?: Transaction | null;
}

export function TransactionForm({ open, onClose, categories, transaction }: Props) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!transaction;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "expense", date: new Date().toISOString().split("T")[0] },
  });

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category_id: transaction.category_id ?? null,
        date: transaction.date,
      });
    } else {
      reset({ type: "expense", amount: undefined, description: "", category_id: null, date: new Date().toISOString().split("T")[0] });
    }
  }, [transaction, reset]);

  const selectedType = watch("type");

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const payload = {
        type: data.type,
        amount: data.amount,
        description: data.description,
        category_id: data.category_id || null,
        date: data.date,
      };
      if (isEditing) {
        await updateTransaction(transaction!.id, payload);
        toast({ title: "Transação atualizada" });
      } else {
        await createTransaction(payload);
        toast({ title: "Transação criada" });
      }
      onClose();
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? "Editar transação" : "Nova transação"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              {(["income", "expense"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selectedType === t
                      ? t === "income"
                        ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                        : "bg-rose-950 border-rose-700 text-rose-400"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {t === "income" ? "↑ Receita" : "↓ Despesa"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register("amount")}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" placeholder="Ex: Almoço, Salário..." {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={watch("category_id") ?? "none"}
              onValueChange={(v) => setValue("category_id", v === "none" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
