import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createCheckoutSession } from "@/lib/stripe-functions";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      { title: "Pricing — Birdie subscriptions" },
      { name: "description", content: "Monthly £8 or yearly £80 (save 17%). Cancel anytime. 10% minimum to charity." },
    ],
  }),
});

const PERKS = [
  "Enter every monthly draw",
  "Track your last 5 Stableford scores",
  "Pick & switch your charity any time",
  "10% min subscription → charity",
  "Cancel anytime",
];
function Pricing() {
  const { session } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(plan: string) {
    if (!session) {
      window.location.href = "/signup";
      return;
    }

    setLoading(plan);
    try {
      const priceId =
        plan === "Monthly"
          ? import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID
          : import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID;

      const { url } = await createCheckoutSession({
        data: {
          priceId,
          userId: session.user.id,
          email: session.user.email!,
        },
      });

      if (url) window.location.href = url;
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-5 sm:px-8 pt-16 sm:pt-24 pb-12 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing</div>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-bold tracking-tight text-balance">
          One plan. Two ways to pay.
        </h1>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          Same access, same draws, same impact. Annual saves you 17%.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { plan: "Monthly", price: "£8", period: "/month", note: "Pay as you go", featured: false },
            { plan: "Yearly", price: "£80", period: "/year", note: "Save £16 — 2 months free", featured: true },
          ].map((p, i) => (
            <motion.div key={p.plan}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`rounded-3xl p-8 sm:p-10 ${p.featured ? "bg-primary text-primary-foreground shadow-elevated" : "bg-card border border-border"}`}>
              {p.featured && <div className="inline-block text-xs font-semibold uppercase tracking-wider bg-accent text-accent-foreground rounded-full px-3 py-1 mb-4">Best value</div>}
              <div className="font-display text-lg font-semibold">{p.plan}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl font-bold tracking-tight">{p.price}</span>
                <span className={p.featured ? "text-primary-foreground/60" : "text-muted-foreground"}>{p.period}</span>
              </div>
              <div className={`mt-2 text-sm ${p.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.note}</div>

              <ul className="mt-8 space-y-3">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm">
                    <Check className={`h-5 w-5 shrink-0 mt-0.5 ${p.featured ? "text-accent" : "text-success"}`} />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleSubscribe(p.plan)}
                disabled={loading === p.plan}
                size="lg" 
                className={`mt-8 w-full h-12 ${p.featured ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-foreground text-background hover:bg-foreground/90"}`}
              >
                {loading === p.plan ? "Redirecting…" : `Choose ${p.plan.toLowerCase()}`}
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Prize pool grows with every subscriber. Charity contributions paid out monthly. Cancel anytime — no fees.
        </p>
      </section>
    </PublicLayout>
  );
}
