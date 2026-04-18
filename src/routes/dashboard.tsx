import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { LogOut, Trophy, Heart, Calendar, ListChecks, ShieldCheck, Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Birdie" }] }),
});

type Profile = { id: string; full_name: string | null; email: string; charity_id: string | null; charity_percentage: number };
type Charity = { id: string; name: string; slug: string };
type Score = { id: string; score: number; played_on: string };
type Subscription = { id: string; plan: string; status: string; amount_cents: number; current_period_end: string | null };
type Winner = { id: string; tier: string; prize_cents: number; status: string; created_at: string; verification_url: string | null; draw_id: string };

const scoreSchema = z.object({
  score: z.number().int().min(1, "1–45").max(45, "1–45"),
  played_on: z.string().min(1, "Pick a date"),
});

function Dashboard() {
  const navigate = useNavigate();
  const { session, loading, isAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;
    Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("charities").select("id,name,slug").order("name"),
      supabase.from("scores").select("*").eq("user_id", uid).order("played_on", { ascending: false }),
      supabase.from("subscriptions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("winners").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    ]).then(([p, c, s, sub, w]) => {
      setProfile(p.data as Profile);
      setCharities((c.data as Charity[]) ?? []);
      setScores((s.data as Score[]) ?? []);
      setSubscription(sub.data as Subscription | null);
      setWinners((w.data as Winner[]) ?? []);
    });
  }, [session]);

  async function refresh() {
    if (!session) return;
    const uid = session.user.id;
    const [p, s, sub, w] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("scores").select("*").eq("user_id", uid).order("played_on", { ascending: false }),
      supabase.from("subscriptions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("winners").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    ]);
    setProfile(p.data as Profile);
    setScores((s.data as Score[]) ?? []);
    setSubscription(sub.data as Subscription | null);
    setWinners((w.data as Winner[]) ?? []);
  }

  if (loading || !session) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  const subActive = subscription?.status === "active";
  const charity = charities.find(c => c.id === profile?.charity_id);

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dashboard</div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">
              Hi {profile?.full_name?.split(" ")[0] ?? "there"} 👋
            </h1>
          </div>
          <div className="flex gap-2">
            {isAdmin && <Button asChild variant="outline" size="sm"><Link to="/admin"><ShieldCheck className="h-4 w-4 mr-1" /> Admin</Link></Button>}
            <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>

        {/* Status cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatusCard icon={<ShieldCheck />} label="Subscription" value={subActive ? "Active" : (subscription?.status ?? "Inactive")} accent={subActive} />
          <StatusCard icon={<ListChecks />} label="Scores logged" value={`${scores.length}/5`} />
          <StatusCard icon={<Heart />} label="Charity" value={charity?.name ?? "Not set"} />
          <StatusCard icon={<Trophy />} label="Wins" value={String(winners.length)} />
        </div>
        {!subActive && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-2xl bg-accent/10 border border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <div className="text-sm text-balance">
                <span className="font-semibold text-foreground">You're not currently entered in draws.</span>
                <p className="text-muted-foreground">Start your subscription to enter this month's prize pool.</p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
              <Link to="/pricing">View Plans</Link>
            </Button>
          </motion.div>
        )}

        <Tabs defaultValue="overview" className="mt-10">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="charity">Charity</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="winnings">Winnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab subscription={subscription} scores={scores} charity={charity ?? null} winners={winners} />
          </TabsContent>
          <TabsContent value="scores" className="mt-6">
            <ScoresTab scores={scores} onChange={refresh} subActive={subActive} />
          </TabsContent>
          <TabsContent value="charity" className="mt-6">
            <CharityTab profile={profile} charities={charities} onChange={refresh} />
          </TabsContent>
          <TabsContent value="subscription" className="mt-6">
            <SubscriptionTab subscription={subscription} />
          </TabsContent>
          <TabsContent value="winnings" className="mt-6">
            <WinningsTab winners={winners} onChange={refresh} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border ${accent ? "bg-accent border-accent text-accent-foreground" : "bg-card border-border"}`}>
      <div className="flex items-center gap-2 text-xs font-medium opacity-70">
        <span className="h-4 w-4">{icon}</span>{label}
      </div>
      <div className="mt-2 font-display text-xl font-semibold truncate">{value}</div>
    </motion.div>
  );
}

function OverviewTab({ subscription, scores, charity, winners }: { subscription: Subscription | null; scores: Score[]; charity: Charity | null; winners: Winner[] }) {
  const lastScore = scores[0];
  const totalWon = winners.filter(w => w.status === "paid").reduce((s, w) => s + w.prize_cents, 0);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Your participation</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{subscription?.plan ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Renewal</dt><dd className="font-medium">{subscription?.current_period_end ? format(new Date(subscription.current_period_end), "PP") : "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Most recent score</dt><dd className="font-medium">{lastScore ? `${lastScore.score} (${format(new Date(lastScore.played_on), "PP")})` : "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Charity</dt><dd className="font-medium">{charity?.name ?? "Not set"}</dd></div>
        </dl>
      </div>
      <div className="rounded-2xl border border-border bg-gradient-primary text-primary-foreground p-6">
        <div className="text-xs font-semibold uppercase tracking-wider opacity-60">Total won</div>
        <div className="mt-2 font-display text-5xl font-bold">£{(totalWon / 100).toFixed(2)}</div>
        <p className="mt-2 text-sm opacity-70">Across {winners.length} win{winners.length === 1 ? "" : "s"}.</p>
      </div>
    </div>
  );
}

function ScoresTab({ scores, onChange, subActive }: { scores: Score[]; onChange: () => void; subActive: boolean }) {
  const [score, setScore] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  async function add() {
    const parsed = scoreSchema.safeParse({ score: Number(score), played_on: date });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("scores").insert({ user_id: u.user.id, score: parsed.data.score, played_on: parsed.data.played_on });
    if (error) { toast.error(error.message); return; }
    setScore("");
    toast.success("Score added");
    onChange();
  }
  async function remove(id: string) {
    const { error } = await supabase.from("scores").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    onChange();
  }
  async function saveEdit(id: string) {
    const n = Number(editVal);
    if (!Number.isInteger(n) || n < 1 || n > 45) { toast.error("Score must be 1–45"); return; }
    const { error } = await supabase.from("scores").update({ score: n }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEditing(null);
    onChange();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Add a score</h3>
        <p className="text-sm text-muted-foreground mt-1">Stableford 1–45. Newest replaces the oldest after 5.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="s">Score</Label>
            <Input id="s" type="number" min={1} max={45} value={score} onChange={(e) => setScore(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="d">Date</Label>
            <Input id="d" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <Button onClick={add} className="mt-4 bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4 mr-1" /> Add score</Button>
        {!subActive && <p className="text-xs text-muted-foreground mt-3">Scores log even without an active subscription, but you'll only enter draws while subscribed.</p>}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Your last 5 scores</h3>
        {scores.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-3">No scores yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {scores.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">{format(new Date(s.played_on), "PP")}</div>
                {editing === s.id ? (
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} max={45} value={editVal} onChange={(e) => setEditVal(e.target.value)} className="w-20 h-9" />
                    <Button size="sm" onClick={() => saveEdit(s.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="font-display text-2xl font-bold">{s.score}</div>
                    <button onClick={() => { setEditing(s.id); setEditVal(String(s.score)); }} className="text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CharityTab({ profile, charities, onChange }: { profile: Profile | null; charities: Charity[]; onChange: () => void }) {
  const [charityId, setCharityId] = useState(profile?.charity_id ?? "");
  const [pct, setPct] = useState(profile?.charity_percentage ?? 10);
  const [saving, setSaving] = useState(false);
  const charity = charities.find(c => c.id === charityId);

  useEffect(() => { if (profile) { setCharityId(profile.charity_id ?? ""); setPct(profile.charity_percentage); } }, [profile]);

  async function save() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ charity_id: charityId || null, charity_percentage: pct }).eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Charity preferences saved");
    onChange();
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-2xl">
      <h3 className="font-display text-lg font-semibold">Your chosen cause</h3>
      <p className="text-sm text-muted-foreground mt-1">Minimum 10% of your subscription goes to charity. You can increase this any time.</p>
      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label>Charity</Label>
          <Select value={charityId} onValueChange={setCharityId}>
            <SelectTrigger><SelectValue placeholder="Pick a charity" /></SelectTrigger>
            <SelectContent>
              {charities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="text-xs">
            <Link to="/charities" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              Browse the directory <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Contribution: {pct}%</Label>
            <span className="text-xs text-muted-foreground">10–100%</span>
          </div>
          <Slider min={10} max={100} step={5} value={[pct]} onValueChange={(v) => setPct(v[0])} />
        </div>
        <div className="pt-4 mt-6 border-t border-border">
          <h4 className="text-sm font-semibold">One-off support</h4>
          <p className="text-xs text-muted-foreground mt-1">Make an independent donation to {charity?.name || 'your chosen cause'}.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={async () => {
             const { data: u } = await supabase.auth.getUser();
             if (!u.user || !charityId) return;
             // Here we would normally trigger a Stripe one-time payment,
             // but for this demo we'll just log it to the contributions table.
             const { error } = await supabase.from('donations').insert({
               user_id: u.user.id,
               charity_id: charityId,
               amount_cents: 500 // £5
             });
             if (error) toast.error(error.message);
             else toast.success("£5.00 donation logged for " + (charity?.name || 'charity'));
          }}>
            Donate £5.00 once
          </Button>
        </div>
        <div className="pt-6">
          <Button onClick={save} disabled={saving} className="bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto">
            {saving ? "Saving…" : "Save preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionTab({ subscription }: { subscription: Subscription | null }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-2xl">
      <h3 className="font-display text-lg font-semibold">Subscription</h3>
      {subscription ? (
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{subscription.plan}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><Badge variant={subscription.status === "active" ? "default" : "secondary"}>{subscription.status}</Badge></dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Amount</dt><dd className="font-medium">£{(subscription.amount_cents / 100).toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Renews</dt><dd className="font-medium">{subscription.current_period_end ? format(new Date(subscription.current_period_end), "PP") : "—"}</dd></div>
        </dl>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">You don't have an active subscription yet.</p>
          <Button asChild className="mt-4 bg-foreground text-background hover:bg-foreground/90"><Link to="/pricing">Choose a plan</Link></Button>
          <p className="text-xs text-muted-foreground mt-3">Stripe checkout is configured in the next setup step — once enabled, your subscription will sync here automatically.</p>
        </div>
      )}
    </div>
  );
}

function WinningsTab({ winners, onChange }: { winners: Winner[]; onChange: () => void }) {
  const [uploading, setUploading] = useState<string | null>(null);

  async function uploadProof(winnerId: string, file: File) {
    setUploading(winnerId);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const path = `${u.user.id}/${winnerId}-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("verifications").upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); setUploading(null); return; }
    const { error } = await supabase.from("winners").update({ verification_url: path, status: "pending" }).eq("id", winnerId);
    setUploading(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Proof uploaded — awaiting verification");
    onChange();
  }

  async function viewProof(path: string) {
    const { data, error } = await supabase.storage.from("verifications").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Could not load proof"); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  if (winners.length === 0) {
    return <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <Trophy className="h-10 w-10 mx-auto text-muted-foreground" />
      <p className="mt-3 text-muted-foreground">No wins yet. Keep playing — next month could be yours.</p>
    </div>;
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
            <div className="font-display text-2xl font-bold mt-2">£{(w.prize_cents / 100).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">{format(new Date(w.created_at), "PP")}</div>
          </div>
          {w.status === "verification_required" && (
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadProof(w.id, e.target.files[0])} />
              <span className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-foreground text-background hover:bg-foreground/90 ${uploading === w.id ? "opacity-50" : ""}`}>
                {uploading === w.id ? "Uploading…" : "Upload scorecard proof"}
              </span>
            </label>
          )}
          {w.verification_url && (
            <button onClick={() => viewProof(w.verification_url!)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              View proof <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
