import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Log in — Birdie" }] }),
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { setErr(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) setErr(error.message);
    else navigate({ to: "/dashboard" });
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-5 py-20">
        <h1 className="font-display text-4xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Log in to your Birdie account.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <div className="text-sm text-destructive">{err}</div>}
          <Button type="submit" disabled={loading} className="w-full h-11 bg-foreground text-background hover:bg-foreground/90">
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          No account? <Link to="/signup" className="text-foreground font-medium underline">Sign up</Link>
        </p>
      </div>
    </PublicLayout>
  );
}
