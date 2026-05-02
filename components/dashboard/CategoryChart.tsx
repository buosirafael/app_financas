"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryExpense } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: CategoryExpense[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: CategoryExpense }> }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: { icon } } = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="font-medium">{icon} {name}</p>
      <p className="text-muted-foreground">{formatCurrency(value)}</p>
    </div>
  );
}

export function CategoryChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos por categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Nenhuma despesa no período
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gastos por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value, entry) => {
                const item = entry.payload as unknown as CategoryExpense;
                return (
                  <span className="text-xs text-muted-foreground">
                    {item?.icon} {value}
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
