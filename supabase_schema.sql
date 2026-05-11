-- Supabase Schema for Crypto Charity Transparency Platform

-- 1. ADMISSION & ROLES
-- This table tracks which Auth users have administrative privileges.
CREATE TABLE public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHARITY APPLICATIONS
-- Reusable enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected', 'archived');

CREATE TABLE public.charity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    charity_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    status public.application_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHARITY WALLETS
-- Approved addresses for accepting crypto donations
CREATE TABLE public.charity_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charity_id UUID NOT NULL REFERENCES public.charity_applications(id) ON DELETE CASCADE,
    blockchain TEXT NOT NULL, -- e.g., 'ethereum', 'solana', 'polygon'
    address TEXT NOT NULL,
    label TEXT, -- e.g., 'Main Donation Wallet', 'Operational Fund'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a charity doesn't duplicate the same wallet address on the same chain
    UNIQUE(blockchain, address)
);

-- 4. PAYOUT & IMPACT PROOFS
-- The "Transparency" layer: linking blockchain transactions to real-world evidence
CREATE TABLE public.payout_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.charity_wallets(id) ON DELETE CASCADE,
    tx_hash TEXT NOT NULL,
    amount_crypto NUMERIC NOT NULL,
    amount_usd NUMERIC, -- Estimated value at time of payout
    description TEXT NOT NULL, -- e.g., 'Purchased 500 blankets for earthquake victims'
    evidence_url TEXT, -- Link to photographic proof, receipt, or IPFS document
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_proofs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES: ADMins
CREATE POLICY "Admins are viewable by authenticated users" 
ON public.admins FOR SELECT TO authenticated USING (true);

-- POLICIES: CHARITY APPLICATIONS
CREATE POLICY "Users can view their own applications" 
ON public.charity_applications FOR SELECT TO authenticated 
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can submit applications" 
ON public.charity_applications FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update application status" 
ON public.charity_applications FOR UPDATE TO authenticated 
USING (public.is_admin());

-- POLICIES: WALLETS (Public read for transparency)
CREATE POLICY "Wallets are viewable by everyone" 
ON public.charity_wallets FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can manage wallets" 
ON public.charity_wallets FOR ALL TO authenticated 
USING (public.is_admin());

-- POLICIES: PAYOUT PROOFS (Public read for transparency)
CREATE POLICY "Proofs are viewable by everyone" 
ON public.payout_proofs FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can manage proofs" 
ON public.payout_proofs FOR ALL TO authenticated 
USING (public.is_admin());

-- 6. OPTIMIZED INDEXES
CREATE INDEX idx_charity_apps_user ON public.charity_applications(user_id);
CREATE INDEX idx_charity_apps_status ON public.charity_applications(status);
CREATE INDEX idx_wallets_charity ON public.charity_wallets(charity_id);
CREATE INDEX idx_proofs_wallet ON public.payout_proofs(wallet_id);
CREATE INDEX idx_proofs_tx ON public.payout_proofs(tx_hash);
