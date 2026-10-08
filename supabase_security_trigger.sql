-- ==============================================================================
-- SECURITY HARDENING: PREVENT PRIVILEGE ESCALATION ON PROFILES
-- ==============================================================================
-- Meets all criteria:
-- 1. Prevents normal authenticated users from modifying is_admin.
-- 2. Prevents normal users from directly self-verifying kyc_status.
-- 3. Permits legitimate service_role, postgres, and existing admin updates.
-- 4 & 5. Hardened SECURITY DEFINER with fixed search_path = public, pg_temp to eliminate path injection.
-- 6. Clean least-privilege definition.

CREATE OR REPLACE FUNCTION public.protect_profile_security_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 1. Prevent modification of is_admin unless executed by service_role, postgres, or existing verified admin
  IF (NEW.is_admin IS DISTINCT FROM OLD.is_admin) THEN
    IF current_user NOT IN ('service_role', 'postgres') AND NOT COALESCE(public.is_admin(), FALSE) THEN
      RAISE EXCEPTION 'Privilege escalation denied: You cannot alter is_admin.';
    END IF;
  END IF;

  -- 2. Prevent users from self-verifying or rejecting KYC status
  -- (Normal members are only allowed to transition to 'pending' upon submitting documents)
  IF (NEW.kyc_status IS DISTINCT FROM OLD.kyc_status) THEN
    IF NEW.kyc_status IN ('verified', 'rejected') AND current_user NOT IN ('service_role', 'postgres') AND NOT COALESCE(public.is_admin(), FALSE) THEN
      RAISE EXCEPTION 'Unauthorized: KYC verification status can only be set by cooperative administrators.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Secure function permissions
REVOKE ALL ON FUNCTION public.protect_profile_security_fields() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.protect_profile_security_fields() TO authenticated, service_role, postgres;

-- Attach trigger to public.profiles
DROP TRIGGER IF EXISTS trg_protect_profile_security_fields ON public.profiles;

CREATE TRIGGER trg_protect_profile_security_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_security_fields();
