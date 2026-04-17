# Birdie — Golf Charity Subscription Platform

Golf performance tracking meets charitable impact.

## Newly Added Functionality

### 1. Stripe Integration
- **Checkout Flow**: Integrated Stripe Checkout for Monthly and Yearly plans.
- **Webhooks**: Automated subscription lifecycle management (creation, renewal, cancellation, lapses) via Stripe webhooks.
- **Customer Portal**: Direct access to manage subscriptions from the dashboard.

### 2. Score Management Enhancements
- **Rolling Replacement**: Automated maintenance of the "Last 5 scores". When a 6th score is entered, the oldest record is automatically retired (implemented via Supabase Trigger).

### 3. Charity & Donations
- **Signup Selection**: Users now select their primary charity cause during the registration flow.
- **Independent Donations**: Added the ability to make one-off contributions to chosen charities directly from the dashboard.
- **Improved Tracking**: Added `charity_contributions` table to track all donor impact.

### 4. System Improvements
- **Security & RLS**: Robust Row Level Security policies for all new tables.
- **Transactional Logic**: Payout tracking for winners and contribution histories.

## Setup

1. **Environment Variables**: Copy `.env.example` to `.env` and fill in your Stripe and Supabase credentials.
2. **Database Migration**: Apply the SQL provided in `supabase/migrations/20260417000000_missing_features.sql`.
3. **Stripe Webhook**: Configure your Stripe webhook to point to `/api/stripe/webhook`.
