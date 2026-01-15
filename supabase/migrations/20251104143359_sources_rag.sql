-- ============================================================================
-- SOURCES RAG EXTENSION
-- ============================================================================
-- Adds vector embeddings, document chunks, and classification fields
-- to enable RAG (Retrieval Augmented Generation) capabilities

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- ALTER sou_publishers: Update taxonomy and reliability model
-- ============================================================================

-- Drop old constraint and add new publisher_type options
ALTER TABLE public.sou_publishers DROP CONSTRAINT IF EXISTS sou_publishers_publisher_type_check;
ALTER TABLE public.sou_publishers ADD CONSTRAINT sou_publishers_publisher_type_check
  CHECK (publisher_type IN (
    'administration',  -- Public administration (any level): Comune, Regione, MEF, EU
    'news',            -- News and media: Il Sole 24 Ore, ANSA
    'academia',        -- Universities, research centers: Politecnico, CNR
    'organization',    -- Institutes, foundations, NGOs: Fondazione Cariplo, ISPI
    'other',           -- Generic websites, unclassified
    -- Legacy values (for existing data)
    'official', 'academic', 'social', 'open_data', 'gazette'
  ));

-- Add reliability tier
ALTER TABLE public.sou_publishers
  ADD COLUMN IF NOT EXISTS reliability_tier text NOT NULL DEFAULT 'unverified'
  CHECK (reliability_tier IN ('official', 'verified', 'unverified'));

-- Update reliability_score to 0-1 scale (was 0-10)
-- First drop old constraint, then add new one
ALTER TABLE public.sou_publishers DROP CONSTRAINT IF EXISTS sou_publishers_reliability_score_check;
ALTER TABLE public.sou_publishers ALTER COLUMN reliability_score SET DEFAULT 0.5;
ALTER TABLE public.sou_publishers ADD CONSTRAINT sou_publishers_reliability_score_check
  CHECK (reliability_score >= 0.0 AND reliability_score <= 10.0);  -- Allow both scales during migration

-- ============================================================================
-- ALTER sou_documents: Add classification and embedding fields
-- ============================================================================

-- Update document_type constraint to include new types
ALTER TABLE public.sou_documents DROP CONSTRAINT IF EXISTS sou_documents_document_type_check;
ALTER TABLE public.sou_documents ADD CONSTRAINT sou_documents_document_type_check
  CHECK (document_type IN (
    'pdf',               -- PDF document (primary type for this subsystem)
    'html',              -- HTML/web page
    'other',             -- Other document types
    -- Legacy values (for existing data)
    'article', 'post', 'gazette_issue', 'press_release', 'minutes', 'report', 'legislation'
  ));

-- Add classification fields
ALTER TABLE public.sou_documents
  ADD COLUMN IF NOT EXISTS document_category text CHECK (document_category IN (
    'budget',            -- Budget documents, financial reports
    'regulation',        -- Laws, regulations, ordinances
    'contract',          -- Contracts, agreements, tenders
    'report',            -- Reports, studies, analyses
    'minutes',           -- Meeting minutes, deliberations
    'announcement',      -- Public announcements, notices
    'other'              -- Other / unclassified
  ));

ALTER TABLE public.sou_documents
  ADD COLUMN IF NOT EXISTS administrative_level text CHECK (administrative_level IN (
    'municipal',         -- City/town level
    'regional',          -- Region/state level
    'national',          -- Country level
    'eu',                -- European Union
    'other'              -- Other
  ));

ALTER TABLE public.sou_documents
  ADD COLUMN IF NOT EXISTS fiscal_year integer;

ALTER TABLE public.sou_documents
  ADD COLUMN IF NOT EXISTS classification_method text CHECK (classification_method IN (
    'manual',            -- Manually classified
    'auto',              -- Rule-based classification
    'llm'                -- LLM-assisted classification
  ));

-- Add embedding status fields
ALTER TABLE public.sou_documents
  ADD COLUMN IF NOT EXISTS embedding_status text NOT NULL DEFAULT 'pending' CHECK (embedding_status IN (
    'pending',       -- Not yet processed for embeddings
    'processing',    -- Currently generating embeddings
    'completed',     -- Embeddings generated successfully
    'failed'         -- Embedding generation failed
  ));

ALTER TABLE public.sou_documents
  ADD COLUMN IF NOT EXISTS chunk_count integer DEFAULT 0;

ALTER TABLE public.sou_documents
  ADD COLUMN IF NOT EXISTS file_path text;

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

