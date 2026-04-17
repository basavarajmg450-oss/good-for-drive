import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function SiteHeader() {
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const links = [
    { to: "/how-it-works", label: "How it works" },
    { to: "/charities", label: "Charities" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
          <span className="h-7 w-7 rounded-lg bg-gradient-accent shadow-glow grid place-items-center text-primary-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          Birdie
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {authed ? (
            <Button asChild size="sm"><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
              <Button asChild size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-5 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm py-2">{l.label}</Link>
            ))}
            <div className="flex gap-2 pt-2">
              {authed ? (
                <Button asChild className="flex-1"><Link to="/dashboard">Dashboard</Link></Button>
              ) : (
                <>
                  <Button asChild variant="outline" className="flex-1"><Link to="/login">Log in</Link></Button>
                  <Button asChild className="flex-1 bg-foreground text-background"><Link to="/signup">Get started</Link></Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
