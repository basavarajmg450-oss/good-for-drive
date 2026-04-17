import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [
    { title: "About Birdie — golf, prizes, charity" },
    { name: "description", content: "Birdie blends performance tracking with monthly prize draws — every subscription funds real charitable impact." },
  ]}),
});

function About() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</div>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-bold tracking-tight text-balance">
          A round of golf with a side of impact.
        </h1>
        <div className="mt-10 prose prose-lg max-w-none text-muted-foreground space-y-5">
          <p>Birdie was built on a simple idea: the things you already do can fund the things you care about. Most golfers track their scores anyway. Most of us would happily contribute to a great cause if it were easy. We made it easy.</p>
          <p>Subscribers log their five most recent Stableford scores. Each month, those scores feed a draw with three prize tiers. A guaranteed minimum of 10% of every subscription flows to a charity the subscriber chose at signup — and members can boost that share whenever they want.</p>
          <p>We're starting with golf. Soon: teams, corporate accounts, country-by-country charity catalogues, and dedicated fundraising campaigns. The platform was designed from day one to scale.</p>
          <p className="font-display text-foreground text-xl font-semibold pt-4">Play with purpose.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
