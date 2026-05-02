"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/lib/hooks/use-toast";
import { Pencil, Trash2, Plus, X, Check, Loader2 } from "lucide-react";
import type { Category } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  icon: z.string().min(1, "Ícone obrigatório"),
  color: z.string().min(1, "Cor obrigatória"),
});

type FormData = z.infer<typeof schema>;

const PRESET_COLORS = [
  "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4",
  "#10b981", "#34d399", "#94a3b8", "#f87171", "#fb923c",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { icon: "📦", color: "#94a3b8" },
  });

  const selectedColor = watch("color");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const cats = await getCategories();
    setCategories(cats);
    setLoading(false);
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    reset({ name: cat.name, icon: cat.icon ?? "📦", color: cat.color ?? "#94a3b8" });
    setShowForm(true);
  }

  function startCreate() {
    setEditing(null);
    reset({ name: "", icon: "📦", color: "#94a3b8" });
    setShowForm(true);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, data);
        toast({ title: "Categoria atualizada" });
      } else {
        await createCategory(data);
        toast({ title: "Categoria criada" });
      }
      setShowForm(false);
      await load();
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id);
      toast({ title: "Categoria excluída" });
      await load();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  }

  const systemCats = categories.filter((c) => c.user_id === null);
  const userCats = categories.filter((c) => c.user_id !== null);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Organize suas transações por categoria</p>
        </div>
        <Button onClick={startCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{editing ? "Editar categoria" : "Nova categoria"}</h3>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                <div className="space-y-2 w-20">
                  <Label htmlFor="icon">Ícone</Label>
                  <Input id="icon" className="text-center text-lg" maxLength={2} {...register("icon")} />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Ex: Streaming, Academia..." {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue("color", color)}
                      className="h-7 w-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setValue("color", e.target.value)}
                    className="h-7 w-7 rounded-full cursor-pointer border-0 bg-transparent p-0"
                    title="Cor personalizada"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editing ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="space-y-6">
          {userCats.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Minhas categorias</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userCats.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: `${cat.color}25` }}>
                        {cat.icon}
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(cat)}>
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
                            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Transações com esta categoria ficarão sem categoria.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(cat.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Categorias padrão</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {systemCats.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: `${cat.color}25` }}>
                      {cat.icon}
                    </div>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Padrão</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
