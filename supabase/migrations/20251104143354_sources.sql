-- ============================================================================
-- SOURCES SUBSYSTEM (sou_)
-- ============================================================================
-- Publishers (origins) and Documents (individual content pieces)
-- A Publisher is where content comes from (e.g., "Comune di Milano website")
-- A Document is a single piece of content (e.g., a specific article, PDF, post)

-- ============================================================================
-- PUBLISHERS: Origins/sources of content
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sou_publishers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name text NOT NULL,
  description text,
  url text,                                      -- Base URL of the publisher
  feed_url text,                                 -- RSS/API endpoint if available

  -- Classification
  publisher_type text NOT NULL CHECK (publisher_type IN (
    'official',      -- Government websites, official portals
    'news',          -- News outlets, media organizations
    'academic',      -- Research institutions, universities
    'social',        -- Social media accounts
    'open_data',     -- Open data portals, APIs
    'gazette'        -- Official gazettes (Gazzetta Ufficiale, etc.)
  )),
  language text,                                 -- BCP 47 tag (e.g., 'it-IT', 'en-US')

  -- Quality & Trust
  reliability_score numeric(3,1) CHECK (reliability_score >= 0 AND reliability_score <= 10),

  -- Operational
  update_frequency text CHECK (update_frequency IN (
    'realtime',      -- Updates continuously
    'daily',         -- Daily updates
    'weekly',        -- Weekly updates
    'monthly',       -- Monthly updates
    'irregular'      -- No predictable schedule
  )),
  access_method text CHECK (access_method IN (
    'rss',           -- RSS/Atom feed
    'api',           -- Structured API
    'scrape',        -- Web scraping required
    'manual'         -- Manual data entry
  )),
  is_active boolean NOT NULL DEFAULT true,

  -- Flexible data
  coverage jsonb DEFAULT '{}',                   -- { topics: [], entity_ids: [] }
  metadata jsonb DEFAULT '{}',                   -- Additional publisher-specific data

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sou_publishers_type ON public.sou_publishers(publisher_type);
CREATE INDEX IF NOT EXISTS idx_sou_publishers_active ON public.sou_publishers(is_active);
CREATE INDEX IF NOT EXISTS idx_sou_publishers_reliability ON public.sou_publishers(reliability_score);

CREATE TRIGGER set_updated_at_sou_publishers
  BEFORE UPDATE ON public.sou_publishers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- DOCUMENTS: Individual content pieces
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sou_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  publisher_id uuid REFERENCES public.sou_publishers(id) ON DELETE SET NULL,

  -- Identity
  url text,                                      -- Original URL (nullable for manual entries)
  title text,
  document_type text NOT NULL CHECK (document_type IN (
    'article',           -- News article, blog post
    'pdf',               -- PDF document
    'post',              -- Social media post
    'gazette_issue',     -- Official gazette issue
    'press_release',     -- Press release
    'minutes',           -- Meeting minutes
    'report',            -- Official report
    'legislation',       -- Law, regulation, ordinance text
    'other'              -- Other document types
  )),
  language text,                                 -- BCP 47 tag
  published_at timestamptz,                      -- Original publication date

  -- Content
  raw_content text,                              -- Full text/HTML
  content_hash text,                             -- SHA-256 for deduplication

  -- Fetch status
  fetch_status text NOT NULL DEFAULT 'pending' CHECK (fetch_status IN (
    'pending',       -- Not yet fetched
    'fetching',      -- Currently fetching
    'fetched',       -- Successfully fetched
    'failed'         -- Fetch failed
  )),
  fetch_error text,                              -- Error message if failed
  fetched_at timestamptz,

  -- Processing status
  processing_status text NOT NULL DEFAULT 'unprocessed' CHECK (processing_status IN (
    'unprocessed',   -- Not yet analyzed
    'processing',    -- Currently being analyzed
    'processed',     -- Analysis complete
    'discarded'      -- Marked as not relevant
  )),

  -- AI-generated fields
  summary text,                                  -- AI-generated summary
  extracted_data jsonb DEFAULT '{}',             -- AI-extracted: entities, dates, topics, people

  -- Flexible data
  metadata jsonb DEFAULT '{}',                   -- Additional document-specific data

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sou_documents_publisher ON public.sou_documents(publisher_id);
CREATE INDEX IF NOT EXISTS idx_sou_documents_type ON public.sou_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_sou_documents_fetch_status ON public.sou_documents(fetch_status);
CREATE INDEX IF NOT EXISTS idx_sou_documents_processing_status ON public.sou_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_sou_documents_published_at ON public.sou_documents(published_at);
CREATE INDEX IF NOT EXISTS idx_sou_documents_url ON public.sou_documents(url);
CREATE INDEX IF NOT EXISTS idx_sou_documents_content_hash ON public.sou_documents(content_hash);

CREATE TRIGGER set_updated_at_sou_documents
  BEFORE UPDATE ON public.sou_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
