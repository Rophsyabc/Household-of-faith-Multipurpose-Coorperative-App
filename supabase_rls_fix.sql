-- ============================================================
-- PHASE 1.1 — RLS HARDENING: profiles table
-- ============================================================
-- CRITICAL SECURITY FIX
--
-- PROBLEM:  "Profiles viewable" policy uses `USING (true)`, which
--           allows ANY authenticated user to SELECT every other
--           user's profile data (NIN, phone, address, occupation,
--           next-of-kin, KYC status, email).
--
-- FIX:      Users may only SELECT their own profile. Admins may
--           SELECT any profile. Admin status is verified server-side
--           by the is_admin() SECURITY DEFINER function.
--
-- NOTE:     RLS policies are ALWAYS enforced server-side (including
--           by the anon role). The service_role key has BYPASSRLS=true
--           by default and is a server-side secret; admin Server Actions
--           may use it, but the RLS boundary above prevents client-driven
--           data leakage.
-- ============================================================

-- 1. Remove the overly permissive policy
DROP POLICY IF EXISTS "Profiles viewable" ON profiles;

-- 2. Add least-privilege policy
--    Normal user: auth.uid() = own profile ID
--    Admin: server-side authorized via is_admin() SECURITY DEFINER
CREATE POLICY "Profiles own" ON profiles
    FOR SELECT
    USING (auth.uid() = id OR is_admin());

-- 3. Keep UPDATE/DELETE on own profile + admins manage all
DROP POLICY IF EXISTS "Profiles update own" ON profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;

CREATE POLICY "Profiles update own" ON profiles
    FOR UPDATE USING (auth.uid() = id OR is_admin());

CREATE POLICY "Admins manage profiles" ON profiles
    FOR ALL USING (is_admin());

-- ============================================================
-- Verify the resulting policies (run after applying)
-- ============================================================
-- SELECT policyname, qual, type FROM pg_policies WHERE tablename = 'profiles';