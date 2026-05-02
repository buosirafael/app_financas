"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/types";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

interface Props {
  categories: Category[];
}

export function TransactionFilters({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value === "all" || value === "") {
      p.delete(key);
    } else {
      p.set(key, value);
    }
    p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={params.get("month") ?? "all"} onValueChange={(v) => setParam("month", v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os meses</SelectItem>
          {MONTHS.map((m, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={params.get("year") ?? "all"} onValueChange={(v) => setParam("year", v)}>
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={params.get("type") ?? "all"} onValueChange={(v) => setParam("type", v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={params.get("category") ?? "all"} onValueChange={(v) => setParam("category", v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
