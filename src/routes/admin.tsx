import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Plus, Play, Check, X, Trash2, Trophy, Users, Heart, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({ meta: [{ title: "Admin — Birdie" }] }),
});

type ProfileRow = { id: string; email: string; full_name: string | null; charity_id: string | null; charity_percentage: number };
type Charity = { id: string; name: string; slug: string; tagline: string | null; description: string | null; image_url: string | null; category: string | null; featured: boolean };
type Draw = { id: string; draw_month: string; mode: "random" | "weighted"; status: string; winning_numbers: number[] | null; prize_pool_cents: number; jackpot_rollover_cents: number };
type WinnerRow = { id: string; user_id: string; tier: string; prize_cents: number; status: string; verification_url: string | null; created_at: string; draw_id: string };
type SubRow = { user_id: string; status: string; amount_cents: number; plan: string };

function Admin() {
  const navigate = useNavigate();
  const { session, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!session) navigate({ to: "/login" });
      else if (!isAdmin) navigate({ to: "/dashboard" });
    }
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">Admin Console</h1>

        <Tabs defaultValue="reports" className="mt-8">
          <TabsList className="bg-card border border-border flex flex-wrap h-auto">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="charities">Charities</TabsTrigger>
            <TabsTrigger value="draws">Draws</TabsTrigger>
            <TabsTrigger value="winners">Winners</TabsTrigger>
          </TabsList>
          <TabsContent value="reports" className="mt-6"><ReportsTab /></TabsContent>
          <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>
          <TabsContent value="charities" className="mt-6"><CharitiesTab /></TabsContent>
          <TabsContent value="draws" className="mt-6"><DrawsTab /></TabsContent>
          <TabsContent value="winners" className="mt-6"><WinnersTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ReportsTab() {
  const [stats, setStats] = useState({ users: 0, activeSubs: 0, charityTotal: 0, prizePool: 0, draws: 0 });
  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("amount_cents", { count: "exact" }).eq("status", "active"),
      supabase.from("draws").select("prize_pool_cents", { count: "exact" }),
    ]).then(([u, s, d]) => {
      const totalSubs = (s.data ?? []).reduce((sum, r) => sum + (r.amount_cents ?? 0), 0);
      const totalPool = (d.data ?? []).reduce((sum, r) => sum + (r.prize_pool_cents ?? 0), 0);
      setStats({
        users: u.count ?? 0,
        activeSubs: s.count ?? 0,
        charityTotal: Math.round(totalSubs * 0.1),
        prizePool: totalPool,
        draws: d.count ?? 0,
      });
    });
  }, []);
  const cards = [
    { label: "Total users", value: stats.users, icon: Users },
    { label: "Active subscriptions", value: stats.activeSubs, icon: Sparkles },
    { label: "Charity contributions", value: `£${(stats.charityTotal / 100).toFixed(2)}`, icon: Heart },
    { label: "Total prize pool", value: `£${(stats.prizePool / 100).toFixed(2)}`, icon: Trophy },
    { label: "Draws run", value: stats.draws, icon: Play },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map(c => (
        <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
          <c.icon className="h-5 w-5 text-muted-foreground" />
          <div className="mt-3 text-xs text-muted-foreground">{c.label}</div>
          <div className="font-display text-2xl font-bold mt-1">{c.value}</div>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [subs, setSubs] = useState<Record<string, SubRow>>({});
  useEffect(() => { reload(); }, []);
  async function reload() {
    const [{ data: u }, { data: s }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("user_id,status,amount_cents,plan"),
    ]);
    setUsers((u as ProfileRow[]) ?? []);
    const map: Record<string, SubRow> = {};
    ((s as SubRow[]) ?? []).forEach(r => { map[r.user_id] = r; });
    setSubs(map);
  }
  async function setStatus(userId: string, status: "active" | "lapsed" | "cancelled" | "pending") {
    const existing = subs[userId];
    if (!existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("subscriptions").insert({ user_id: userId, plan: "monthly", status, amount_cents: 800 } as any);
      if (error) toast.error(error.message); else toast.success("Subscription created");
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("subscriptions").update({ status } as any).eq("user_id", userId);
      if (error) toast.error(error.message); else toast.success("Updated");
    }
    reload();
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Subscription</th><th className="text-left p-3">Charity %</th><th className="text-left p-3">Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-medium">{u.full_name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3"><Badge variant={subs[u.id]?.status === "active" ? "default" : "secondary"}>{subs[u.id]?.status ?? "none"}</Badge></td>
                <td className="p-3">{u.charity_percentage}%</td>
                <td className="p-3 flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setStatus(u.id, "active")}>Activate</Button>
                  <Button size="sm" variant="ghost" onClick={() => setStatus(u.id, "lapsed")}>Lapse</Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No users yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CharitiesTab() {
  const [items, setItems] = useState<Charity[]>([]);
  const [editing, setEditing] = useState<Charity | null>(null);
  const [form, setForm] = useState<Partial<Charity>>({});

  useEffect(() => { reload(); }, []);
  async function reload() {
    const { data } = await supabase.from("charities").select("*").order("name");
    setItems((data as Charity[]) ?? []);
  }
  function startNew() { setEditing(null); setForm({ name: "", slug: "", tagline: "", description: "", image_url: "", category: "Health", featured: false }); }
  function startEdit(c: Charity) { setEditing(c); setForm(c); }
  async function save() {
    if (!form.name || !form.slug) { toast.error("Name and slug required"); return; }
    if (editing) {
      const { error } = await supabase.from("charities").update(form).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("charities").insert(form as Charity);
      if (error) { toast.error(error.message); return; }
      toast.success("Created");
    }
    setEditing(null); setForm({});
    reload();
  }
  async function remove(id: string) {
    if (!confirm("Delete this charity?")) return;
    const { error } = await supabase.from("charities").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    reload();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">All charities</h3>
          <Button size="sm" onClick={startNew}><Plus className="h-4 w-4 mr-1" /> New</Button>
        </div>
        <ul className="divide-y divide-border">
          {items.map(c => (
            <li key={c.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{c.name} {c.featured && <Badge className="ml-1">Featured</Badge>}</div>
                <div className="text-xs text-muted-foreground">{c.tagline}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(c)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {(editing !== null || Object.keys(form).length > 0) && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="font-display text-lg font-semibold">{editing ? "Edit charity" : "New charity"}</h3>
          <div className="space-y-2"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Slug</Label><Input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="space-y-2"><Label>Tagline</Label><Input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Category</Label><Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div className="space-y-2"><Label>Featured</Label>
              <Select value={String(form.featured ?? false)} onValueChange={(v) => setForm({ ...form, featured: v === "true" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save} className="bg-foreground text-background hover:bg-foreground/90">Save</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setForm({}); }}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DrawsTab() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM-01"));
  const [mode, setMode] = useState<"random" | "weighted">("random");
  const [simResult, setSimResult] = useState<string | null>(null);

  useEffect(() => { reload(); }, []);
  async function reload() {
    const { data } = await supabase.from("draws").select("*").order("draw_month", { ascending: false });
    setDraws((data as Draw[]) ?? []);
  }

  async function createDraw() {
    // Compute prize pool: 50% of subscription revenue this month for active subscribers.
    const { data: subs } = await supabase.from("subscriptions").select("amount_cents").eq("status", "active");
    const revenue = (subs ?? []).reduce((s: number, r: { amount_cents: number }) => s + r.amount_cents, 0);
    const prevJackpot = draws[0]?.status === "published" && (!draws[0].winning_numbers || draws[0].winning_numbers.length === 0) ? draws[0].jackpot_rollover_cents : 0;
    const pool = Math.round(revenue * 0.5) + prevJackpot;
    const { error } = await supabase.from("draws").insert({ draw_month: month, mode, prize_pool_cents: pool, jackpot_rollover_cents: 0 });
    if (error) { toast.error(error.message); return; }
    toast.success("Draw created");
    reload();
  }

  function pickRandom(): number[] {
    const set = new Set<number>();
    while (set.size < 5) set.add(Math.floor(Math.random() * 45) + 1);
    return Array.from(set).sort((a, b) => a - b);
  }

  async function pickWeighted(): Promise<number[]> {
    // Weighted by score frequency — pick top 5 most-frequent values across all scores
    const { data } = await supabase.from("scores").select("score");
    const counts = new Map<number, number>();
    (data ?? []).forEach((r: { score: number }) => counts.set(r.score, (counts.get(r.score) ?? 0) + 1));
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 5);
    while (sorted.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1;
      if (!sorted.includes(n)) sorted.push(n);
    }
    return sorted.sort((a, b) => a - b);
  }

  async function simulate(d: Draw) {
    const numbers = d.mode === "random" ? pickRandom() : await pickWeighted();
    const { data: entries } = await supabase.from("draw_entries").select("user_id,numbers").eq("draw_id", d.id);
    const tally = { match_5: 0, match_4: 0, match_3: 0 };
    (entries ?? []).forEach((e: { numbers: number[] }) => {
      const matches = e.numbers.filter(n => numbers.includes(n)).length;
      if (matches === 5) tally.match_5++;
      else if (matches === 4) tally.match_4++;
      else if (matches === 3) tally.match_3++;
    });
    await supabase.from("draws").update({ winning_numbers: numbers, status: "simulated" }).eq("id", d.id);
    setSimResult(`Numbers: [${numbers.join(", ")}] · 5-match: ${tally.match_5} · 4-match: ${tally.match_4} · 3-match: ${tally.match_3}`);
    reload();
  }

  async function publish(d: Draw) {
    if (!d.winning_numbers) { toast.error("Run a simulation first"); return; }
    const { data: entries } = await supabase.from("draw_entries").select("user_id,numbers").eq("draw_id", d.id);
    const tiers = { match_5: [] as string[], match_4: [] as string[], match_3: [] as string[] };
    (entries ?? []).forEach((e: { user_id: string; numbers: number[] }) => {
      const matches = e.numbers.filter(n => d.winning_numbers!.includes(n)).length;
      if (matches === 5) tiers.match_5.push(e.user_id);
      else if (matches === 4) tiers.match_4.push(e.user_id);
      else if (matches === 3) tiers.match_3.push(e.user_id);
    });
    const pool5 = Math.round(d.prize_pool_cents * 0.4);
    const pool4 = Math.round(d.prize_pool_cents * 0.35);
    const pool3 = Math.round(d.prize_pool_cents * 0.25);
    let jackpotRollover = 0;
    const inserts: { draw_id: string; user_id: string; tier: string; prize_cents: number }[] = [];
    if (tiers.match_5.length > 0) tiers.match_5.forEach(uid => inserts.push({ draw_id: d.id, user_id: uid, tier: "match_5", prize_cents: Math.floor(pool5 / tiers.match_5.length) }));
    else jackpotRollover += pool5;
    if (tiers.match_4.length > 0) tiers.match_4.forEach(uid => inserts.push({ draw_id: d.id, user_id: uid, tier: "match_4", prize_cents: Math.floor(pool4 / tiers.match_4.length) }));
    if (tiers.match_3.length > 0) tiers.match_3.forEach(uid => inserts.push({ draw_id: d.id, user_id: uid, tier: "match_3", prize_cents: Math.floor(pool3 / tiers.match_3.length) }));
    if (inserts.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("winners").insert(inserts as any);
      if (error) { toast.error(error.message); return; }
    }
    await supabase.from("draws").update({ status: "published", published_at: new Date().toISOString(), jackpot_rollover_cents: jackpotRollover }).eq("id", d.id);
    toast.success(`Published — ${inserts.length} winners`);
    reload();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">New draw</h3>
        <div className="mt-4 space-y-3">
          <div className="space-y-2"><Label>Month</Label><Input type="date" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
          <div className="space-y-2"><Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as "random" | "weighted")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="random">Random</SelectItem><SelectItem value="weighted">Weighted</SelectItem></SelectContent>
            </Select>
          </div>
          <Button onClick={createDraw} className="w-full bg-foreground text-background hover:bg-foreground/90">Create draw</Button>
        </div>
        {simResult && <div className="mt-4 p-3 rounded-lg bg-accent/30 text-xs">{simResult}</div>}
      </div>

      <div className="lg:col-span-2 space-y-3">
        {draws.map(d => (
          <div key={d.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-display text-lg font-semibold">{format(new Date(d.draw_month), "MMMM yyyy")}</div>
                <div className="text-xs text-muted-foreground mt-1">Mode: {d.mode} · Pool: £{(d.prize_pool_cents / 100).toFixed(2)} {d.jackpot_rollover_cents > 0 && `· Rollover: £${(d.jackpot_rollover_cents / 100).toFixed(2)}`}</div>
              </div>
              <Badge variant={d.status === "published" ? "default" : "secondary"}>{d.status}</Badge>
            </div>
            {d.winning_numbers && (
              <div className="mt-3 flex gap-2">
                {d.winning_numbers.map(n => (
                  <span key={n} className="h-9 w-9 rounded-full bg-accent text-accent-foreground grid place-items-center font-bold text-sm">{n}</span>
                ))}
              </div>
            )}
            {d.status !== "published" && (
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => simulate(d)}><Play className="h-4 w-4 mr-1" /> Simulate</Button>
                {d.status === "simulated" && <Button size="sm" onClick={() => publish(d)} className="bg-foreground text-background hover:bg-foreground/90">Publish results</Button>}
              </div>
            )}
          </div>
        ))}
        {draws.length === 0 && <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">No draws yet.</div>}
      </div>
    </div>
  );
}

function WinnersTab() {
  const [winners, setWinners] = useState<(WinnerRow & { profile?: ProfileRow | null })[]>([]);
  useEffect(() => { reload(); }, []);
  async function reload() {
    const { data: ws } = await supabase.from("winners").select("*").order("created_at", { ascending: false });
    const list = (ws ?? []) as unknown as WinnerRow[];
    const userIds = Array.from(new Set(list.map(w => w.user_id)));
    const profilesRes = userIds.length
      ? await supabase.from("profiles").select("id,email,full_name,charity_id,charity_percentage").in("id", userIds)
      : { data: [] as ProfileRow[] };
    const map = new Map<string, ProfileRow>();
    ((profilesRes.data ?? []) as unknown as ProfileRow[]).forEach(p => map.set(p.id, p));
    setWinners(list.map(w => ({ ...w, profile: map.get(w.user_id) ?? null })));
  }
  async function viewProof(path: string) {
    const { data, error } = await supabase.storage.from("verifications").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Could not load proof"); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }
  async function update(id: string, status: "verified" | "rejected" | "paid", paid = false) {
    const patch: Record<string, string> = { status };
    if (status === "verified") patch.verified_at = new Date().toISOString();
    if (paid) patch.paid_at = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from("winners").update(patch as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    reload();
  }

  return (
    <div className="space-y-3">
      {winners.map(w => (
        <div key={w.id} className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge>{w.tier.replace("_", " ")}</Badge>
              <Badge variant="secondary">{w.status}</Badge>
            </div>
            <div className="font-display text-xl font-bold mt-2">£{(w.prize_cents / 100).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">{w.profile?.full_name ?? w.profile?.email ?? w.user_id} · {format(new Date(w.created_at), "PP")}</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {w.verification_url && <Button size="sm" variant="outline" onClick={() => viewProof(w.verification_url!)}>View proof</Button>}
            {w.status === "pending" && <>
              <Button size="sm" onClick={() => update(w.id, "verified")} className="bg-foreground text-background hover:bg-foreground/90"><Check className="h-4 w-4 mr-1" /> Verify</Button>
              <Button size="sm" variant="outline" onClick={() => update(w.id, "rejected")}><X className="h-4 w-4 mr-1" /> Reject</Button>
            </>}
            {w.status === "verified" && <Button size="sm" onClick={() => update(w.id, "paid", true)} className="bg-success text-success-foreground hover:bg-success/90">Mark as paid</Button>}
          </div>
        </div>
      ))}
      {winners.length === 0 && <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">No winners yet.</div>}
    </div>
  );
}
