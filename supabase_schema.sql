-- ==========================================
-- 1. CLEANUP (Idempotency)
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

DROP TABLE IF EXISTS marketplace_items CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS referral_ledger CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS dividend_payouts CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS cooperative_treasury CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS ajo_ledger CASCADE;
DROP TABLE IF EXISTS ajo_members CASCADE;
DROP TABLE IF EXISTS ajo_groups CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ==========================================
-- 2. CORE TABLES
-- ==========================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  nin TEXT,
  address TEXT,
  state_of_origin TEXT,
  lga TEXT,
  occupation TEXT,
  work_address TEXT,
  next_of_kin_name TEXT,
  next_of_kin_phone TEXT,
  next_of_kin_address TEXT,
  kyc_status TEXT DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified')),
  id_document_url TEXT,
  live_photo_url TEXT,
  referred_by UUID REFERENCES profiles(id),
  referral_code TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  bank_code TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, account_number)
);

CREATE TABLE ajo_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  contribution_amount NUMERIC NOT NULL,
  late_fee_amount NUMERIC DEFAULT 500.00,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  join_code TEXT,
  current_cycle INT DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ajo_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES ajo_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  position INT NOT NULL,
  UNIQUE(group_id, user_id),
  UNIQUE(group_id, position)
);

CREATE TABLE ajo_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES ajo_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  cycle_number INT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('contribution', 'payout', 'fine')),
  is_late BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('credit', 'debit', 'fee', 'loan', 'dividend', 'referral_bonus', 'repayment', 'transfer_in', 'transfer_out')),
  amount NUMERIC NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed',
  reference TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cooperative_treasury (
  id INT PRIMARY KEY DEFAULT 1,
  total_fees_collected NUMERIC DEFAULT 0.00,
  total_fines_collected NUMERIC DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT one_row CHECK (id = 1)
);

INSERT INTO cooperative_treasury (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount_requested NUMERIC NOT NULL,
  interest_rate NUMERIC DEFAULT 5.00,
  repayment_period_months INT NOT NULL,
  total_to_repay NUMERIC NOT NULL,
  amount_repaid NUMERIC DEFAULT 0.00,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'repaid')),
  admin_feedback TEXT,
  guarantor1_name TEXT, guarantor1_phone TEXT, guarantor1_address TEXT,
  guarantor2_name TEXT, guarantor2_phone TEXT, guarantor2_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0.00,
  category TEXT DEFAULT 'General' CHECK (category IN ('General', 'Emergency', 'Education', 'Business', 'Housing', 'Travel', 'Festive')),
  contribution_frequency TEXT DEFAULT 'Manual' CHECK (contribution_frequency IN ('Manual', 'Daily', 'Weekly', 'Monthly')),
  amount_per_period NUMERIC DEFAULT 0.00,
  deadline DATE,
  is_locked BOOLEAN DEFAULT FALSE,
  early_withdrawal_penalty NUMERIC DEFAULT 0.00,
  streak_count INT DEFAULT 0,
  last_contribution_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_priority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dividend_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_distributed NUMERIC NOT NULL,
  percentage_of_treasury NUMERIC NOT NULL,
  distributed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(id),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  admin_feedback TEXT,
  reference TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE referral_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES profiles(id),
  referred_id UUID REFERENCES profiles(id) UNIQUE,
  bonus_amount NUMERIC DEFAULT 500.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  admin_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE marketplace_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. FUNCTIONS & TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_referral_code TEXT;
    referred_by_id UUID;
    is_first_user BOOLEAN;
BEGIN
  new_referral_code := upper(substring(md5(random()::text) from 1 for 8));
  BEGIN
    referred_by_id := (new.raw_user_meta_data->>'referred_by')::UUID;
  EXCEPTION WHEN OTHERS THEN
    referred_by_id := NULL;
  END;
  SELECT count(*) = 0 INTO is_first_user FROM public.profiles;
  INSERT INTO public.profiles (id, full_name, email, phone, referral_code, referred_by, is_admin)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Member'), new.email, '', new_referral_code, referred_by_id, is_first_user);
  INSERT INTO public.wallets (user_id, balance) VALUES (new.id, 0);
  IF referred_by_id IS NOT NULL THEN
    INSERT INTO public.referral_ledger (referrer_id, referred_id) VALUES (referred_by_id, new.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
DECLARE adm BOOLEAN;
BEGIN
  SELECT is_admin INTO adm FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(adm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_cycle(group_id_param UUID) RETURNS VOID AS $$
BEGIN
  UPDATE ajo_groups SET current_cycle = current_cycle + 1 WHERE id = group_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION collect_registration_fee(fee_amount NUMERIC) RETURNS VOID AS $$
BEGIN
  UPDATE cooperative_treasury SET total_fees_collected = total_fees_collected + fee_amount WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION collect_late_fine(fine_amount NUMERIC) RETURNS VOID AS $$
BEGIN
  UPDATE cooperative_treasury SET total_fines_collected = total_fines_collected + fine_amount WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_wallets_modtime BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bank_accounts_modtime BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ajo_groups_modtime BEFORE UPDATE ON ajo_groups FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_loans_modtime BEFORE UPDATE ON loans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_savings_goals_modtime BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_announcements_modtime BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_withdrawal_requests_modtime BEFORE UPDATE ON withdrawal_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_support_tickets_modtime BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_marketplace_items_modtime BEFORE UPDATE ON marketplace_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- 4. RLS POLICIES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajo_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividend_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "Wallets view own" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view wallets" ON wallets FOR SELECT USING (is_admin());
CREATE POLICY "Bank accounts manage own" ON bank_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view bank accounts" ON bank_accounts FOR SELECT USING (is_admin());
CREATE POLICY "Groups view authenticated" ON ajo_groups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Members join authenticated" ON ajo_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Ledger view members" ON ajo_ledger FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Own transactions view" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view treasury" ON cooperative_treasury FOR SELECT USING (is_admin());
CREATE POLICY "Own loans view" ON loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Loans apply own" ON loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage loans" ON loans FOR ALL USING (is_admin());
CREATE POLICY "Own goals manage" ON savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Announcements view all" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON announcements FOR ALL USING (is_admin());
CREATE POLICY "Own withdrawals manage" ON withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Withdrawals request own" ON withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage withdrawals" ON withdrawal_requests FOR ALL USING (is_admin());
CREATE POLICY "Referrals view own" ON referral_ledger FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Admins manage referrals" ON referral_ledger FOR ALL USING (is_admin());
CREATE POLICY "Own tickets manage" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Support tickets create own" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage tickets" ON support_tickets FOR ALL USING (is_admin());
CREATE POLICY "Marketplace items view all" ON marketplace_items FOR SELECT USING (true);
CREATE POLICY "Marketplace items manage own" ON marketplace_items FOR ALL USING (auth.uid() = seller_id);

-- ==========================================
-- 5. PERFORMANCE INDEXES
-- ==========================================

CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_ajo_members_group_id ON ajo_members(group_id);
CREATE INDEX idx_ajo_ledger_group_cycle ON ajo_ledger(group_id, cycle_number);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_marketplace_items_status ON marketplace_items(status);

-- ==========================================
-- 6. ANALYTICS VIEWS
-- ==========================================

CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT count(*) FROM profiles WHERE kyc_status = 'pending') as pending_kyc_count,
  (SELECT count(*) FROM loans WHERE status = 'pending') as pending_loan_count,
  (SELECT count(*) FROM withdrawal_requests WHERE status = 'pending') as pending_withdrawal_count,
  (SELECT count(*) FROM support_tickets WHERE status = 'open') as open_tickets_count,
  (SELECT COALESCE(sum(amount), 0) FROM transactions WHERE type IN ('credit', 'dividend', 'referral_bonus', 'loan', 'transfer_in')) as total_inflow,
  (SELECT COALESCE(sum(amount), 0) FROM transactions WHERE type IN ('debit', 'transfer_out', 'fee', 'repayment')) as total_outflow,
  (SELECT total_fees_collected FROM cooperative_treasury WHERE id = 1) as treasury_balance;

-- ==========================================
-- 7. REALTIME SETUP
-- ==========================================

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
  notifications, wallets, ajo_ledger, transactions, announcements, 
  support_tickets, marketplace_items, withdrawal_requests, loans;

-- ==========================================
-- 8. STORAGE BUCKETS & POLICIES
-- ==========================================

INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace-images', 'marketplace-images', true) ON CONFLICT DO NOTHING;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Read KYC" ON storage.objects;
    DROP POLICY IF EXISTS "Admin All KYC" ON storage.objects;
    DROP POLICY IF EXISTS "Public Read Marketplace" ON storage.objects;
    DROP POLICY IF EXISTS "Seller Upload Marketplace" ON storage.objects;
    DROP POLICY IF EXISTS "Seller Manage Marketplace" ON storage.objects;
END $$;

CREATE POLICY "Public Read KYC" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents');
CREATE POLICY "Admin All KYC" ON storage.objects FOR ALL USING (bucket_id = 'kyc-documents' AND is_admin());

CREATE POLICY "Public Read Marketplace" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace-images');
CREATE POLICY "Seller Upload Marketplace" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace-images' AND auth.role() = 'authenticated');
CREATE POLICY "Seller Manage Marketplace" ON storage.objects FOR ALL USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);
