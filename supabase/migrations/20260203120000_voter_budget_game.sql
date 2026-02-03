-- Voter Budget Game tables
-- Prefix: gamvot_ (games + voter budget)

-- Items that users can vote on (shared pool per entity)
CREATE TABLE gamvot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES gov_entities(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('ideas', 'likes', 'dislikes')),
  created_by UUID REFERENCES acc_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(entity_id, dimension, text)
);

-- A user's game session
CREATE TABLE gamvot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES gov_entities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES acc_profiles(id),
  anonymous_id TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  CHECK (user_id IS NOT NULL OR anonymous_id IS NOT NULL)
);

-- Individual votes within a session
CREATE TABLE gamvot_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES gamvot_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES gamvot_items(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 5 AND amount <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(session_id, item_id)
);

-- Indexes
CREATE INDEX gamvot_items_entity_dimension ON gamvot_items(entity_id, dimension);
CREATE INDEX gamvot_items_text_search ON gamvot_items USING gin(to_tsvector('simple', text));
CREATE INDEX gamvot_sessions_entity ON gamvot_sessions(entity_id);
CREATE INDEX gamvot_sessions_status ON gamvot_sessions(status);
CREATE INDEX gamvot_votes_item ON gamvot_votes(item_id);

-- View: Item stats (total votes, amount, voter count)
CREATE VIEW gamvot_item_stats AS
SELECT
  i.id,
  i.entity_id,
  i.text,
  i.dimension,
  COALESCE(SUM(v.amount), 0)::INTEGER AS total_amount,
  COUNT(DISTINCT v.session_id)::INTEGER AS voter_count
FROM gamvot_items i
LEFT JOIN gamvot_votes v ON v.item_id = i.id
LEFT JOIN gamvot_sessions s ON s.id = v.session_id AND s.status = 'completed'
GROUP BY i.id;

-- View: Entity stats (for intro page)
CREATE VIEW gamvot_entity_stats AS
SELECT
  entity_id,
  COUNT(DISTINCT id)::INTEGER AS participant_count,
  COALESCE(SUM(total_spent), 0)::INTEGER AS total_invested
FROM (
  SELECT
    s.entity_id,
    s.id,
    SUM(v.amount) AS total_spent
  FROM gamvot_sessions s
  JOIN gamvot_votes v ON v.session_id = s.id
  WHERE s.status = 'completed'
  GROUP BY s.entity_id, s.id
) sub
GROUP BY entity_id;
