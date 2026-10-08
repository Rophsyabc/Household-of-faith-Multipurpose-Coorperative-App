-- ==============================================================================
-- SECURITY HARDENING: PREVENT PRIVILEGE ESCALATION ON PROFILES
-- ==============================================================================
-- This trigger blocks non-service_role users from updating `is_admin` or `kyc_status`.
-- Execute this script in your Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.protect_profile_security_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modification of is_admin unless executed via service role or designated admin
  IF (NEW.is_admin IS DISTINCT FROM OLD.is_admin) THEN
    IF current_user != 'service_role' AND current_user != 'postgres' THEN
      RAISE EXCEPTION 'Privilege escalation denied: You cannot alter is_admin.';
    END IF;
  END IF;

  -- Prevent users from self-verifying KYC status to 'verified'
  IF (NEW.kyc_status = 'verified' AND OLD.kyc_status IS DISTINCT FROM 'verified') THEN
    IF current_user != 'service_role' AND current_user != 'postgres' THEN
      RAISE EXCEPTION 'Unauthorized: KYC verification can only be approved by cooperative administrators.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_security_fields ON public.profiles;

CREATE TRIGGER trg_protect_profile_security_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_security_fields();
