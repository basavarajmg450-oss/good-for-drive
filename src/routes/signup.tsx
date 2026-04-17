import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  component: Signup,
  head: () => ({ meta: [{ title: "Create your account — Birdie" }] }),
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
});

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState<{ id: string; name: string }[]>([]);
  const [charityId, setCharityId] = useState("");

  useState(() => {
    supabase
      .from("charities")
      .select("id,name")
      .order("name")
      .then(({ data }) => setCharities(data || []));
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      return;
    }
    if (!charityId) {
      setErr("Please select a charity");
      return;
    }
    setLoading(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.full_name },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    if (signUpData.user) {
      await supabase
        .from("profiles")
        .update({
          charity_id: charityId,
          charity_percentage: 10,
          signup_complete: true,
        })
        .eq("id", signUpData.user.id);
    }

    setLoading(false);
    navigate({ to: "/dashboard" });
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-5 py-20">
        <h1 className="font-display text-4xl font-bold tracking-tight">Join Birdie</h1>
        <p className="mt-2 text-muted-foreground">Start playing. Start funding causes.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="charity">Choose your initial charity</Label>
            <select 
              id="charity" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={charityId} 
              onChange={(e) => setCharityId(e.target.value)} 
              required
            >
              <option value="">Select a charity…</option>
              {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <p className="text-[10px] text-muted-foreground italic">Minimum 10% of your subscription goes here. You can change this later.</p>
          </div>
          {err && <div className="text-sm text-destructive">{err}</div>}
          <Button type="submit" disabled={loading} className="w-full h-11 bg-foreground text-background hover:bg-foreground/90">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Already a member? <Link to="/login" className="text-foreground font-medium underline">Log in</Link>
        </p>
      </div>
    </PublicLayout>
  );
}
