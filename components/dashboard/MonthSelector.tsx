"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthName } from "@/lib/utils";

interface Props {
  year: number;
  month: number;
}

export function MonthSelector({ year, month }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function navigate(newYear: number, newMonth: number) {
    const p = new URLSearchParams(params.toString());
    p.set("year", String(newYear));
    p.set("month", String(newMonth));
    router.push(`${pathname}?${p.toString()}`);
  }

  function prev() {
    if (month === 1) navigate(year - 1, 12);
    else navigate(year, month - 1);
  }

  function next() {
    if (month === 12) navigate(year + 1, 1);
    else navigate(year, month + 1);
  }

  const label = getMonthName(month, year);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={prev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-36 text-center capitalize">{label}</span>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={next}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
