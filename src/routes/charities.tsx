import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/charities")({
  component: CharityDirectory,
  head: () => ({ meta: [
    { title: "Charity directory — Birdie" },
    { name: "description", content: "Browse vetted charities. Pick the one your subscription funds every month." },
  ]}),
});

type Charity = { id: string; slug: string; name: string; tagline: string | null; image_url: string | null; category: string | null; featured: boolean };

function CharityDirectory() {
  const [items, setItems] = useState<Charity[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  useEffect(() => {
    supabase.from("charities").select("*").order("featured", { ascending: false }).order("name")
      .then(({ data }) => setItems((data as Charity[]) ?? []));
  }, []);

  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.category).filter(Boolean) as string[]))], [items]);
  const filtered = items.filter(i =>
    (cat === "All" || i.category === cat) &&
    (q === "" || i.name.toLowerCase().includes(q.toLowerCase()) || i.tagline?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Charities</div>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-bold tracking-tight text-balance max-w-3xl">
          Pick the cause your subscription funds.
        </h1>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search charities" className="pl-9 h-11" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 h-11 rounded-full text-sm border transition-colors ${cat === c ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No charities match your filters.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.05 }}>
                <Link to="/charities/$slug" params={{ slug: c.slug }} className="block group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-elevated transition-shadow">
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {c.image_url && <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      {c.category && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{c.category}</span>}
                      {c.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Featured</span>}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold">{c.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.tagline}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90"><Link to="/signup">Subscribe & choose your cause</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
