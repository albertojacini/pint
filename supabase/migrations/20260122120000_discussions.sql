-- ============================================================================
-- DISCUSSIONS SUBSYSTEM (disc_)
-- ============================================================================
-- Reddit/Loomio-inspired discussion system with typed posts, threaded comments,
-- upvoting, and structured proposal voting.
-- Dependencies: acc_profiles

-- Posts: polymorphic attachment to provision/entity/idea
CREATE TABLE IF NOT EXISTS public.disc_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('provision', 'entity', 'idea')),
  target_id uuid NOT NULL,
  author_id uuid NOT NULL REFERENCES public.acc_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  post_type text NOT NULL CHECK (post_type IN ('discussion', 'question', 'proposal', 'analysis')),
  score integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX disc_posts_target_idx ON public.disc_posts (target_type, target_id);

CREATE TRIGGER set_updated_at_disc_posts
  BEFORE UPDATE ON public.disc_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comments: threaded via self-referential parent_id
CREATE TABLE IF NOT EXISTS public.disc_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.disc_posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.disc_comments(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.acc_profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  depth integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX disc_comments_post_idx ON public.disc_comments (post_id);

CREATE TRIGGER set_updated_at_disc_comments
  BEFORE UPDATE ON public.disc_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Votes: polymorphic upvotes on posts or comments
CREATE TABLE IF NOT EXISTS public.disc_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.acc_profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX disc_votes_unique ON public.disc_votes (user_id, target_type, target_id);

-- Proposal votes: structured position voting on proposal posts
CREATE TABLE IF NOT EXISTS public.disc_proposal_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.disc_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.acc_profiles(id) ON DELETE CASCADE,
  position text NOT NULL CHECK (position IN ('agree', 'disagree', 'abstain')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX disc_proposal_votes_unique ON public.disc_proposal_votes (user_id, post_id);

CREATE TRIGGER set_updated_at_disc_proposal_votes
  BEFORE UPDATE ON public.disc_proposal_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
