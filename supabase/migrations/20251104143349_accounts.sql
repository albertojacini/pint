-- ============================================================================
-- ACCOUNTS SUBSYSTEM (acc_)
-- ============================================================================
-- User profiles and authentication-related tables
-- Dependencies: auth.users (Supabase managed)

CREATE TABLE IF NOT EXISTS public.acc_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_updated_at_acc_profiles
  BEFORE UPDATE ON public.acc_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
