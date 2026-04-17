import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Heart, Target, Sparkles, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Birdie — Play with purpose. Win for charity." },
      { name: "description", content: "Golf scoring meets monthly prize draws and real charitable impact. Join from £8/month." },
    ],
  }),
});

type Charity = { id: string; name: string; tagline: string | null; image_url: string | null; slug: string };

function HomePage() {
  const [charities, setCharities] = useState<Charity[]>([]);

  useEffect(() => {
    supabase.from("charities").select("id,name,tagline,image_url,slug").eq("featured", true).limit(3)
      .then(({ data }) => setCharities((data as Charity[]) ?? []));
  }, []);

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-accent-foreground" />
              <span>10% of every subscription goes to charity — minimum.</span>
            </div>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight text-balance">
              Play with purpose.
              <br />
              <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Win for charity.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl text-balance">
              Track your last five Stableford scores. Enter monthly prize draws. Fund causes that matter — automatically, every month.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-12 px-6">
                <Link to="/signup">Start your subscription <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { value: "£24k+", label: "Raised this year" },
                { value: "1,200+", label: "Active members" },
                { value: "32", label: "Partner charities" },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <div className="font-display text-2xl sm:text-3xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How it works</div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Three steps. Every month.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Log your scores", body: "Enter your last 5 Stableford scores. We keep the most recent — your card is always live." },
            { icon: Trophy, title: "Enter the draw", body: "Two modes: random lottery or weighted by your score frequency. Three prize tiers, monthly cadence." },
            { icon: Heart, title: "Fund a cause", body: "Pick from 30+ vetted charities. 10% minimum of every subscription goes directly to your chosen cause." },
          ].map((s, i) => (
            <motion.div key={s.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-7 shadow-soft hover:shadow-elevated transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-accent grid place-items-center text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRIZE TIERS */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">Prize pool</div>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight">
                Three tiers. Real money. Rolling jackpot.
              </h2>
              <p className="mt-5 text-primary-foreground/70 max-w-md">
                The prize pool grows with every active subscriber. If no one matches all five, the jackpot rolls into next month — bigger every cycle.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { tier: "5-Number Match", pct: "40%", note: "Jackpot — rolls over if unclaimed", glow: true },
                { tier: "4-Number Match", pct: "35%", note: "Split between all matching tier" },
                { tier: "3-Number Match", pct: "25%", note: "Highest-frequency tier" },
              ].map((t) => (
                <div key={t.tier} className={`rounded-2xl p-6 flex items-center justify-between ${t.glow ? "bg-accent text-accent-foreground" : "bg-primary-foreground/5 border border-primary-foreground/10"}`}>
                  <div>
                    <div className="font-display text-xl font-semibold">{t.tier}</div>
                    <div className={`text-sm mt-1 ${t.glow ? "text-accent-foreground/70" : "text-primary-foreground/60"}`}>{t.note}</div>
                  </div>
                  <div className="font-display text-3xl font-bold">{t.pct}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CHARITIES */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Spotlight</div>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight">Causes we're funding</h2>
          </div>
          <Button asChild variant="ghost"><Link to="/charities">Browse all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {charities.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link to="/charities/$slug" params={{ slug: c.slug }} className="block group">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                  {c.image_url && (
                    <img src={c.image_url} alt={c.name} loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{c.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.tagline}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="rounded-3xl bg-gradient-hero border border-border p-10 sm:p-16 text-center">
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto text-balance">
            Your scores. Their future. One subscription.
          </h2>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Cancel anytime</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Verified charities</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Monthly draws</span>
          </div>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-12 px-6">
              <Link to="/signup">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
