-- Add missing tables and logic for Golf Charity Subscription Platform

-- 1. TRIGGER TO MAINTAIN LAST 5 SCORES
-- When a 6th score is entered, the oldest one for the user is removed.
CREATE OR REPLACE FUNCTION public.maintain_recent_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE id IN (
    SELECT id
    FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY played_on DESC, created_at DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS trigger_maintain_recent_scores ON public.scores;

CREATE TRIGGER trigger_maintain_recent_scores
AFTER INSERT ON public.scores
FOR EACH ROW EXECUTE FUNCTION public.maintain_recent_scores();


-- 2. CHARITY CONTRIBUTIONS TABLE
-- Tracks both subscription-driven and independent donations.
CREATE TABLE IF NOT EXISTS public.charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('subscription', 'independent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for charity_contributions
ALTER TABLE public.charity_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contributions"
  ON public.charity_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contributions"
  ON public.charity_contributions FOR SELECT
  USING (public.has_role('admin', auth.uid()));


-- 3. PAYOUTS TABLE
-- Tracks actual payment processing for winners.
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id UUID REFERENCES public.winners(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  stripe_payout_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- RLS for payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payouts"
  ON public.payouts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.winners 
    WHERE public.winners.id = public.payouts.winner_id 
    AND public.winners.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage payouts"
  ON public.payouts FOR ALL
  USING (public.has_role('admin', auth.uid()));


-- 4. UPDATE WINNERS TABLE (if missing columns)
-- Ensure winners has payout status tracking if not already robust
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='winners' AND column_name='verified_at') THEN
    ALTER TABLE public.winners ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='winners' AND column_name='paid_at') THEN
    ALTER TABLE public.winners ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;


-- 5. UPDATE PROFILES FOR SIGNUP CHOICE
-- Make sure charity_id can be set during signup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_complete BOOLEAN DEFAULT false;
