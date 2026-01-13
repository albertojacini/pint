# Sources Subsystem

Document processing, semantic search, and RAG chat for public policy documents.

## Purpose

Enable semantic search and AI-powered Q&A over public policy documents (budgets, regulations, contracts).

## Scope

- PDF ingestion → text extraction → chunking → embedding → vector search → RAG chat
- Publisher-based reliability scoring inherited by documents

## Out of Scope

Non-PDF formats, versioning, real-time sync, fact-checking, multi-tenant isolation.

## Boundaries

**This subsystem handles:** storage, processing, retrieval of documents.
**NOT responsible for:** trust assessment. Caller provides reliability scores.

```
┌─────────────────────────────────────────────────────────────────┐
│                 Caller / Admin / Future Trust Service           │
│  Decides publisher reliability, provides publisher_id on upload │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Sources Subsystem                            │
│  Stores publishers as-is, ingests docs, classifies (category),  │
│  provides search & chat using stored reliability scores         │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture

```
Ingestion:  Upload → PDF Parser → Classifier → Chunker → Embedder
                                      │
Storage:    PostgreSQL + pgvector     ▼
            sou_publishers ◄─ sou_documents ◄─ sou_document_chunks
                                              └── HNSW Index (cosine)
Retrieval:  Search API ◄── Vector Similarity ◄── Query Embedding
                 │
            Chat API ──► Context Assembly ──► Claude ──► Response
```

## Taxonomy

**Publisher Types:** administration, news, academia, organization, other

**Reliability Tiers:**
- `official` (0.9-1.0): Government sources
- `verified` (0.6-0.9): Verified reliable
- `unverified` (0.0-0.6): Not verified

**Document Categories:** budget, regulation, contract, report, minutes, announcement, other

**Administrative Levels:** municipal, regional, national, eu, other

## Processing Pipeline

1. Receive PDF + publisher_id (defaults to Unknown Publisher if missing)
2. Parse PDF (pdfplumber or Textract)
3. Classify via LLM (category, admin_level, fiscal_year)
4. Chunk: 512 tokens, 50 overlap
5. Embed: OpenAI text-embedding-3-small (1536 dims)
6. Store document + chunks

## Functional Requirements and Capabilities

- **Publisher management:** Create publishers with reliability tier/score
- **Document upload:** Accept PDF, parse text, store with publisher link
- **Auto-classification:** LLM-classify category, admin level, fiscal year on upload
- **Manual override:** Allow caller to override classification fields
- **Deduplication:** Detect duplicate documents via content hash
- **Semantic search:** Vector similarity search with configurable threshold
- **Search filters:** Filter by publisher, category, admin level, min reliability
- **RAG chat:** Answer questions using retrieved chunks as context
- **Source attribution:** Include source references in chat responses
- **Unknown publisher fallback:** Assign unattributed docs to default publisher

## Key Design Decisions

- **Unknown Publisher:** UUID `00000000-0000-0000-0000-000000000000`, reliability 0.3
- **Embeddings:** OpenAI text-embedding-3-small, HNSW index with cosine distance
- **Classification:** Claude Haiku on upload (first 2000 chars)
- **Chat:** Claude Sonnet with top-N retrieved chunks as context

## Future Enhancements

- Store/serve original PDFs
- URL-based ingestion (HTML, webpages)
- Hybrid search (keyword + semantic)
- Conversation memory
- Streaming responses
- Async processing queue
- Document versioning
