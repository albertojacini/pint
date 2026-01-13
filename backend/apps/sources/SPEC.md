# Sources Subsystem Specification

> Document processing, semantic search, and RAG-based chat for public policy documents.

## 1. Overview

### Purpose
Enable semantic search and AI-powered Q&A over public policy documents (budgets, regulations, contracts) for the Pint platform.

### Scope
- PDF document ingestion and processing
- Text extraction, chunking, and embedding
- Semantic search with reliability-weighted ranking
- RAG-based conversational Q&A with source attribution

### Out of Scope (Current Phase)
- Non-PDF formats (HTML, DOCX)
- Document versioning / diff tracking
- Real-time sync with external sources
- Topic tagging and advanced taxonomy
- Fact-checking / content verification
- Multi-tenant isolation

### Boundaries & Responsibilities

This subsystem is responsible for **storage, processing, and retrieval** of documents. It is **not** responsible for trust assessment or verification of sources.

**This Subsystem Does:**
| Responsibility | Description |
|----------------|-------------|
| Publisher CRUD | Store publisher records as provided by caller |
| Document ingestion | Parse PDFs, extract text |
| Document classification | Auto-classify category, fiscal_year via LLM |
| Chunking & embedding | Split text, generate vectors |
| Semantic search | Find relevant chunks by similarity |
| RAG chat | Answer questions using retrieved context |
| Reliability-weighted retrieval | Use reliability scores in ranking (scores provided externally) |

**This Subsystem Does NOT:**
| Responsibility | Owner |
|----------------|-------|
| Determine publisher reliability | Caller / Admin |
| Verify official sources | Caller / Future Trust subsystem |
| Domain pattern matching for trust | Caller / Future Trust subsystem |
| Store original PDF files | Future enhancement |
| Manage user access / permissions | Auth subsystem |

**Key Principle:** When creating a publisher, the **caller decides** the reliability tier and score. This subsystem trusts and stores that decision without validation.

```
┌─────────────────────────────────────────────────────────────────┐
│                 External: Caller / Admin / Trust Service        │
│  • Decides publisher reliability                                │
│  • Provides publisher_id when uploading documents               │
│  • May use domain heuristics, manual review, or ML              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ publisher_id, reliability_tier, reliability_score
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Sources Subsystem (This SPEC)                │
│  • Stores publishers as-is                                      │
│  • Ingests documents linked to publishers                       │
│  • Classifies documents (category, not reliability)             │
│  • Provides search & chat using stored reliability scores       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Ingestion Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Upload API ──► PDF Parser ──► Classifier ──► Chunker ──► Embedder │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Storage Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL + pgvector                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │sou_publishers│◄─│sou_documents │◄─│sou_document_chunks │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
│                                              │                  │
│                                       HNSW Index (cosine)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Retrieval Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Search API ◄── Vector Similarity ◄── Query Embedding          │
│      │                                                          │
│      ▼                                                          │
│  Chat API ──► Context Assembly ──► LLM (Claude) ──► Response    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model

### 3.1 sou_publishers

Source/publisher metadata. **Every document must have a publisher.**

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | uuid | PK | Primary key |
| name | text | ✓ | Publisher name |
| description | text | | Description |
| url | text | | Base URL |
| publisher_type | text | ✓ | See taxonomy below |
| reliability_tier | text | ✓ | official, verified, unverified |
| reliability_score | float | ✓ | 0.0 - 1.0, default 0.5 |
| is_active | boolean | ✓ | Active for ingestion |
| metadata | jsonb | | Flexible metadata |

**Special Record: Unknown Publisher**
```
id: 00000000-0000-0000-0000-000000000000
name: "Unknown Publisher"
publisher_type: "other"
reliability_tier: "unverified"
reliability_score: 0.3
```

### 3.2 sou_documents

Individual documents with classification and processing status.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | uuid | PK | Primary key |
| publisher_id | uuid | ✓ FK | **Required** - publisher reference |
| url | text | | Original source URL |
| title | text | ✓ | Document title |
| document_type | text | ✓ | pdf (extensible later) |
| document_category | text | ✓ | See taxonomy below |
| administrative_level | text | | See taxonomy below |
| fiscal_year | integer | | For budget documents |
| language | text | | ISO code (it, en) |
| published_at | timestamptz | | Original publication date |
| raw_content | text | | Full extracted text |
| content_hash | text | | SHA256 for deduplication |
| summary | text | | AI-generated or provided |
| file_path | text | | Storage path (future) |
| embedding_status | text | ✓ | pending, processing, completed, failed |
| chunk_count | integer | | Number of chunks |
| classification_method | text | | manual, auto, llm |
| metadata | jsonb | | Flexible metadata |

**Reliability**: Documents inherit `reliability_score` from their publisher.

### 3.3 sou_document_chunks

Chunked text with vector embeddings.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | uuid | PK | Primary key |
| document_id | uuid | ✓ FK | Document reference |
| chunk_index | integer | ✓ | Order within document |
| content | text | ✓ | Chunk text |
| content_tokens | integer | | Token count |
| embedding | vector(1536) | | OpenAI embedding |
| metadata | jsonb | | Page number, etc. |

**Index**: HNSW on `embedding` column with cosine distance.

---

## 4. Taxonomy

### 4.1 Publisher Types
| Code | Description | Examples |
|------|-------------|----------|
| `administration` | Public administration (any level) | Comune di Milano, Regione Lombardia, MEF, EU Commission |
| `news` | News and media | Il Sole 24 Ore, ANSA, local newspapers |
| `academia` | Universities, research centers | Politecnico, Bocconi, CNR |
| `organization` | Institutes, foundations, NGOs | Fondazione Cariplo, ISPI, Transparency International |
| `other` | Generic websites, unclassified | Blogs, personal sites, unknown sources |

### 4.2 Reliability Tiers
| Tier | Score Range | Description |
|------|-------------|-------------|
| `official` | 0.9 - 1.0 | Official government source |
| `verified` | 0.6 - 0.9 | Verified reliable source |
| `unverified` | 0.0 - 0.6 | Not verified |

### 4.3 Document Categories
| Code | Description |
|------|-------------|
| `budget` | Budget documents, financial reports |
| `regulation` | Laws, regulations, ordinances |
| `contract` | Contracts, agreements, tenders |
| `report` | Reports, studies, analyses |
| `minutes` | Meeting minutes, deliberations |
| `announcement` | Public announcements, notices |
| `other` | Other / unclassified |

---

## 5. Processing Pipeline

### 5.1 Document Upload Flow

```
1. Receive PDF + publisher_id + optional metadata
2. Validate publisher exists
3. Parse PDF → extract text
4. Classify document (LLM-assisted) → category, admin_level, fiscal_year
5. Chunk text → 512 tokens, 50 overlap
6. Generate embeddings → OpenAI batch
7. Store document + chunks
8. Return document_id + status
```

### 5.2 PDF Parsing
- **Default**: pdfplumber (local, multi-page)
- **Alternative**: AWS Textract (cloud OCR)
- **Output**: Raw text, page count, per-page text

### 5.3 Classification (On Upload)
LLM-assisted classification using a fast model (Claude Haiku).

**Input**: Title + first 2000 characters of text
**Output**:
```json
{
  "document_category": "budget",
  "administrative_level": "municipal",
  "fiscal_year": 2024
}
```

### 5.4 Chunking
- **Strategy**: Paragraph-first, sentence splitting for large blocks
- **Chunk size**: 512 tokens
- **Overlap**: 50 tokens
- **Tokenizer**: tiktoken (GPT-4 encoding)

### 5.5 Embedding
- **Model**: OpenAI text-embedding-3-small
- **Dimensions**: 1536
- **Batching**: 100 texts per API call

---

## 6. API Endpoints

### 6.1 POST /sources/documents/upload

Upload and process a PDF document.

**Request**: multipart/form-data
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | ✓ | PDF file (max 50MB) |
| publisher_id | uuid | ✓ | Publisher reference |
| title | string | | Override extracted title |
| document_category | string | | Override LLM classification |
| administrative_level | string | | Override LLM classification |
| fiscal_year | integer | | Override LLM classification |

**Response**: 200 OK
```json
{
  "document_id": "uuid",
  "title": "Bilancio Milano 2024",
  "publisher_id": "uuid",
  "document_category": "budget",
  "administrative_level": "municipal",
  "fiscal_year": 2024,
  "chunk_count": 300,
  "status": "completed"
}
```

**Errors**:
- 400: Invalid PDF, file too large, missing publisher_id
- 404: Publisher not found

### 6.2 GET /sources/documents/{id}

Get document details and status.

**Response**: 200 OK
```json
{
  "id": "uuid",
  "title": "string",
  "publisher": {
    "id": "uuid",
    "name": "Comune di Milano",
    "reliability_score": 0.95
  },
  "document_category": "budget",
  "administrative_level": "municipal",
  "embedding_status": "completed",
  "chunk_count": 300,
  "created_at": "2024-01-13T..."
}
```

### 6.3 POST /sources/search

Semantic search with reliability-weighted ranking.

**Request**:
```json
{
  "query": "spesa per il personale",
  "limit": 10,
  "threshold": 0.5,
  "filters": {
    "publisher_id": "uuid",
    "document_category": "budget",
    "administrative_level": "municipal",
    "min_reliability": 0.7
  }
}
```

**Response**: 200 OK
```json
{
  "query": "spesa per il personale",
  "results": [
    {
      "chunk_id": "uuid",
      "document_id": "uuid",
      "document_title": "Bilancio Milano 2024",
      "publisher_name": "Comune di Milano",
      "reliability_score": 0.95,
      "content": "Il costo del personale è di € 1.736.483 migliaia...",
      "similarity": 0.85,
      "chunk_index": 197
    }
  ],
  "total": 10
}
```

### 6.4 POST /sources/chat

RAG-based Q&A with source attribution.

**Request**:
```json
{
  "query": "Quanto ha speso Milano per il personale nel 2024?",
  "filters": {
    "document_ids": ["uuid"],
    "min_reliability": 0.7
  },
  "include_sources": true
}
```

**Response**: 200 OK
```json
{
  "answer": "Il Comune di Milano ha speso €584 milioni per il personale nel 2024...",
  "sources": [
    {
      "chunk_id": "uuid",
      "document_id": "uuid",
      "document_title": "Bilancio Milano 2024",
      "publisher_name": "Comune di Milano",
      "reliability_score": 0.95,
      "content": "...",
      "similarity": 0.87
    }
  ]
}
```

### 6.5 GET /sources/publishers

List publishers.

**Response**: 200 OK
```json
{
  "publishers": [
    {
      "id": "uuid",
      "name": "Comune di Milano",
      "publisher_type": "administration",
      "reliability_tier": "official",
      "reliability_score": 0.95,
      "document_count": 42
    }
  ]
}
```

### 6.6 POST /sources/publishers

Create a new publisher.

**Request**:
```json
{
  "name": "Comune di Milano",
  "url": "https://comune.milano.it",
  "publisher_type": "administration",
  "reliability_tier": "official",
  "reliability_score": 0.95
}
```

---

## 7. Configuration

### Required
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings |

### PDF Parsing
| Variable | Default | Description |
|----------|---------|-------------|
| `PDF_PARSER` | `pdfplumber` | Parser: pdfplumber, textract |
| `AWS_ACCESS_KEY_ID` | - | For Textract |
| `AWS_SECRET_ACCESS_KEY` | - | For Textract |
| `AWS_REGION` | `us-east-1` | AWS region |

### Classification
| Variable | Default | Description |
|----------|---------|-------------|
| `CLASSIFY_ON_UPLOAD` | `true` | Auto-classify documents |
| `CLASSIFICATION_MODEL` | `claude-haiku` | Model for classification |

### Search
| Variable | Default | Description |
|----------|---------|-------------|
| `SEARCH_DEFAULT_LIMIT` | `10` | Default result count |
| `SEARCH_DEFAULT_THRESHOLD` | `0.5` | Min similarity score |
| `SEARCH_RELIABILITY_WEIGHT` | `0.0` | Reliability boost (0-1) |

### Chat
| Variable | Default | Description |
|----------|---------|-------------|
| `CHAT_MODEL` | `claude-sonnet-4-5-20250929` | LLM for responses |
| `CHAT_CONTEXT_CHUNKS` | `5` | Chunks in context |

---

## 8. Error Handling

Fail fast, minimal error handling per project guidelines.

| Scenario | Response |
|----------|----------|
| Invalid PDF | 400 Bad Request |
| File > 50MB | 400 Bad Request |
| Missing publisher_id | 400 Bad Request |
| Publisher not found | 404 Not Found |
| Document not found | 404 Not Found |
| OpenAI API error | 500 (propagate) |
| Parse failure | 500 (propagate) |

---

## 9. Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| PDF parsing (pdfplumber) | ✅ Done | |
| PDF parsing (Textract) | ✅ Done | Swappable |
| Text chunking | ✅ Done | 512/50 tokens |
| Embedding generation | ✅ Done | OpenAI |
| Vector storage | ✅ Done | pgvector + HNSW |
| Upload endpoint | ✅ Done | Needs: required publisher, classification |
| Search endpoint | ✅ Done | Needs: filters, reliability weighting |
| Chat endpoint | ✅ Done | Needs: filters |
| Document classification | ❌ Pending | LLM-assisted on upload |
| Publisher CRUD | ⚠️ Partial | Create exists, needs list endpoint |
| Unknown publisher record | ❌ Pending | Seed data |
| Reliability inheritance | ❌ Pending | Add to search ranking |
| Filter support | ❌ Pending | category, admin_level, reliability |

---

## 10. Desiderata (Future Enhancements)

### Phase 2: Storage & Retrieval
- [ ] Store original PDFs in Supabase Storage
- [ ] Serve original documents via API
- [ ] URL-based document ingestion
- [ ] Hybrid search (keyword + semantic)

### Phase 3: Enhanced Classification
- [ ] Topic tagging (controlled vocabulary)
- [ ] Multi-label classification
- [ ] Classification confidence scores
- [ ] Manual classification override UI

### Phase 4: Chat Improvements
- [ ] Conversation history / memory
- [ ] Streaming responses
- [ ] Citation with page numbers
- [ ] Multi-document comparative answers

### Phase 5: Scale & Operations
- [ ] Async processing queue
- [ ] Processing webhooks
- [ ] Batch ingestion API
- [ ] Rate limiting
- [ ] Query caching

### Phase 6: Advanced Features
- [ ] Document versioning
- [ ] Change detection (re-fetch URLs)
- [ ] Cross-document fact verification
- [ ] Scheduled ingestion from feeds

---

## 11. Open Questions

1. Should search results include a combined score (similarity + reliability) or separate scores?
2. Default behavior when publisher_id is not provided: reject or use unknown-publisher?
3. Should classification failures block document creation or proceed with defaults?

---

*Last updated: 2025-01-13*
