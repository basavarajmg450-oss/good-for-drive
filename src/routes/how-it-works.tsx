import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorks,
  head: () => ({ meta: [
    { title: "How Birdie works — scoring, draws and prize tiers" },
    { name: "description", content: "Log five Stableford scores, enter monthly draws across three tiers, fund a charity. Here's exactly how it works." },
  ]}),
});

function HowItWorks() {
  const steps = [
    { n: "01", title: "Subscribe", body: "Pick monthly or yearly. A fixed share of your subscription funds the prize pool; another goes to your chosen charity." },
    { n: "02", title: "Log five scores", body: "Enter your last five Stableford scores (1–45). We keep only the most recent five — when you add a new one, the oldest drops off." },
    { n: "03", title: "Get drawn in", body: "Each month, admins run the draw. Choose the random mode (pure lottery) or weighted mode (your score frequency influences your numbers)." },
    { n: "04", title: "Match to win", body: "Three tiers: match 5, 4, or 3. Prize money splits equally between winners in each tier. Unclaimed jackpots roll over." },
    { n: "05", title: "Verify and get paid", body: "Winners upload a screenshot of their scorecard. Admin verifies. Payout goes out — straight to you." },
    { n: "06", title: "Charity gets funded", body: "Every month, your chosen cause receives at least 10% of your subscription. Boost it whenever you want, or donate directly on top." },
  ];
  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How it works</div>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-bold tracking-tight text-balance">
          Six steps from joining to making impact.
        </h1>
      </section>
      <section className="mx-auto max-w-4xl px-5 sm:px-8 pb-20">
        <div className="space-y-3">
          {steps.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex gap-6">
              <div className="font-display text-2xl font-bold text-muted-foreground/40 shrink-0 w-12">{s.n}</div>
              <div>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 flex gap-3">
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90"><Link to="/signup">Get started</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/pricing">See pricing</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
