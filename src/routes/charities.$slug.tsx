import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/charities/$slug")({
  component: CharityDetail,
  head: ({ params }) => ({ meta: [
    { title: `${params.slug} — Birdie charity` },
  ]}),
});

type Charity = { id: string; name: string; tagline: string | null; description: string | null; image_url: string | null; website: string | null; category: string | null };

function CharityDetail() {
  const { slug } = Route.useParams();
  const [c, setC] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    supabase.from("charities").select("*").eq("slug", slug).maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setErr(true);
        else setC(data as Charity);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <PublicLayout><div className="mx-auto max-w-3xl px-5 py-20 text-muted-foreground">Loading…</div></PublicLayout>;
  if (err || !c) return <PublicLayout><div className="mx-auto max-w-3xl px-5 py-20"><h1 className="font-display text-3xl font-bold">Charity not found</h1><Link to="/charities" className="mt-4 inline-block text-accent-foreground underline">Back to directory</Link></div></PublicLayout>;

  return (
    <PublicLayout>
      <article className="mx-auto max-w-4xl px-5 sm:px-8 pt-10 pb-24">
        <Link to="/charities" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All charities
        </Link>

        <div className="mt-6 aspect-[16/9] rounded-3xl overflow-hidden bg-muted">
          {c.image_url && <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />}
        </div>

        <div className="mt-8 flex items-center gap-2">
          {c.category && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{c.category}</span>}
        </div>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">{c.name}</h1>
        {c.tagline && <p className="mt-3 text-xl text-muted-foreground">{c.tagline}</p>}

        {c.description && <p className="mt-8 text-lg leading-relaxed text-foreground/80">{c.description}</p>}

        <div className="mt-10 flex gap-3 flex-wrap">
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90">
            <Link to="/signup">Subscribe & support {c.name}</Link>
          </Button>
          {c.website && (
            <Button asChild size="lg" variant="outline">
              <a href={c.website} target="_blank" rel="noreferrer noopener">Visit website <ExternalLink className="ml-1 h-4 w-4" /></a>
            </Button>
          )}
        </div>
      </article>
    </PublicLayout>
  );
}
