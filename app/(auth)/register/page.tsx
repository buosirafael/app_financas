"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Loader2, MailCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setEmailSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-8 w-8" />
            <span className="text-2xl font-bold text-foreground">Finanças</span>
          </div>
          <p className="text-muted-foreground text-sm">Comece a organizar suas finanças hoje</p>
        </div>

        {emailSent ? (
          <Card>
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Verifique seu email!</h2>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de confirmação para
                </p>
                <p className="text-sm font-medium text-foreground break-all">{email}</p>
              </div>
              <div className="bg-secondary/60 rounded-lg px-4 py-3 text-sm text-muted-foreground text-left w-full space-y-1">
                <p className="font-medium text-foreground">O que fazer agora:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abra sua caixa de entrada</li>
                  <li>Clique no link de confirmação</li>
                  <li>Volte aqui para entrar</li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground">
                Não recebeu? Verifique o spam ou{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => { setEmailSent(false); setEmail(""); setPassword(""); setConfirm(""); }}
                >
                  tente novamente
                </button>
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Ir para o login</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Criar conta</CardTitle>
              <CardDescription>Cadastre-se gratuitamente</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar senha</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Criar conta
                </Button>
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Entrar
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
