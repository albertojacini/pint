-- ============================================================================
-- SOURCES SUBSYSTEM (sou_)
-- ============================================================================
-- Publishers (origins) and Documents (individual content pieces)
-- A Publisher is where content comes from (e.g., "Comune di Milano website")
-- A Document is a single piece of content (e.g., a specific article, PDF, post)

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

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

  -- Classification (per SPEC.md taxonomy)
  publisher_type text NOT NULL CHECK (publisher_type IN (
    'administration',  -- Public administration (any level): Comune, Regione, MEF, EU
    'news',            -- News and media: Il Sole 24 Ore, ANSA
    'academia',        -- Universities, research centers: Politecnico, CNR
    'organization',    -- Institutes, foundations, NGOs: Fondazione Cariplo, ISPI
    'other'            -- Generic websites, unclassified
  )),
  language text,                                 -- BCP 47 tag (e.g., 'it-IT', 'en-US')

  -- Reliability (per SPEC.md)
  reliability_tier text NOT NULL DEFAULT 'unverified' CHECK (reliability_tier IN (
    'official',      -- Official government source (0.9-1.0)
    'verified',      -- Verified reliable source (0.6-0.9)
    'unverified'     -- Not verified (0.0-0.6)
  )),
  reliability_score numeric(3,2) DEFAULT 0.5 CHECK (reliability_score >= 0.0 AND reliability_score <= 1.0),

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
  document_type text NOT NULL DEFAULT 'pdf' CHECK (document_type IN (
    'pdf',               -- PDF document (primary type for this subsystem)
    'html',              -- HTML/web page
    'other'              -- Other document types
  )),

  -- Classification (per SPEC.md, LLM-assisted on upload)
  document_category text CHECK (document_category IN (
    'budget',            -- Budget documents, financial reports
    'regulation',        -- Laws, regulations, ordinances
    'contract',          -- Contracts, agreements, tenders
    'report',            -- Reports, studies, analyses
    'minutes',           -- Meeting minutes, deliberations
    'announcement',      -- Public announcements, notices
    'other'              -- Other / unclassified
  )),
  administrative_level text CHECK (administrative_level IN (
    'municipal',         -- City/town level
    'regional',          -- Region/state level
    'national',          -- Country level
    'eu',                -- European Union
    'other'              -- Other
  )),
  fiscal_year integer,
  classification_method text CHECK (classification_method IN (
    'manual',            -- Manually classified
    'auto',              -- Rule-based classification
    'llm'                -- LLM-assisted classification
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

  -- Embedding status (for document processing pipeline)
  embedding_status text NOT NULL DEFAULT 'pending' CHECK (embedding_status IN (
    'pending',       -- Not yet processed for embeddings
    'processing',    -- Currently generating embeddings
    'completed',     -- Embeddings generated successfully
    'failed'         -- Embedding generation failed
  )),
  chunk_count integer DEFAULT 0,
  file_path text,                                -- Storage path for uploaded files

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

-- ============================================================================
-- DOCUMENT CHUNKS: Chunked content with embeddings for semantic search
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sou_document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship to parent document
  document_id uuid NOT NULL REFERENCES public.sou_documents(id) ON DELETE CASCADE,

  -- Chunk positioning
  chunk_index integer NOT NULL,              -- 0-based position in document

  -- Content
  content text NOT NULL,                     -- The chunk text
  content_tokens integer,                    -- Approximate token count

  -- Embedding (1536 dimensions for text-embedding-3-small)
  embedding vector(1536),                    -- OpenAI embedding vector

  -- Metadata for retrieval context
  metadata jsonb DEFAULT '{}',               -- { page_number, section_title, etc. }

  -- Timestamps
  created_at timestamptz DEFAULT now(),

  -- Ensure unique chunk per document
  UNIQUE (document_id, chunk_index)
);

-- Index for efficient document lookups
CREATE INDEX IF NOT EXISTS idx_sou_document_chunks_document
  ON public.sou_document_chunks(document_id);

-- HNSW index for fast approximate nearest neighbor search (cosine distance)
CREATE INDEX IF NOT EXISTS idx_sou_document_chunks_embedding
  ON public.sou_document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- SEED DATA: Unknown Publisher (fallback for documents without publisher)
-- ============================================================================
INSERT INTO public.sou_publishers (
  id,
  name,
  publisher_type,
  reliability_tier,
  reliability_score,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Unknown Publisher',
  'other',
  'unverified',
  0.30,
  true
) ON CONFLICT (id) DO NOTHING;
