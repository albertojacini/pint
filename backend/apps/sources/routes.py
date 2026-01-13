"""API routes for the sources app."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from langchain.chat_models import init_chat_model

from core.config import settings
from apps.sources.models import (
    ChatRequest,
    ChatResponse,
    DocumentResponse,
    Publisher,
    PublisherCreate,
    PublisherResponse,
    SearchRequest,
    SearchResponse,
    SearchResult,
    UploadDocumentResponse,
)
from apps.sources.services import SourcesService

router = APIRouter(prefix="/sources", tags=["sources"])

_service: Optional[SourcesService] = None


def get_service() -> SourcesService:
    global _service
    if _service is None:
        _service = SourcesService()
    return _service


# ============================================================================
# Publishers
# ============================================================================


@router.get("/publishers", response_model=list[PublisherResponse])
async def list_publishers() -> list[PublisherResponse]:
    """List all publishers with document counts."""
    service = get_service()
    publishers = await service.list_publishers()
    return [PublisherResponse(**p) for p in publishers]


@router.post("/publishers", response_model=Publisher)
async def create_publisher(publisher: PublisherCreate) -> Publisher:
    """Create a new publisher."""
    service = get_service()
    return await service.create_publisher(publisher)


# ============================================================================
# Document Upload & Processing
# ============================================================================


@router.post("/documents/upload", response_model=UploadDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    publisher_id: Optional[str] = Form(None),
    document_category: Optional[str] = Form(None),
    administrative_level: Optional[str] = Form(None),
    fiscal_year: Optional[int] = Form(None),
) -> UploadDocumentResponse:
    """
    Upload a PDF document for processing.

    The document will be:
    1. Parsed using pdfplumber (or Textract if configured)
    2. Classified using LLM (category, admin level, fiscal year)
    3. Split into chunks
    4. Embedded using OpenAI
    5. Stored for semantic search

    If publisher_id is not provided, the document will be assigned to
    the "Unknown Publisher".
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()

    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 50MB.",
        )

    service = get_service()

    doc = await service.process_pdf_upload(
        file_bytes=file_bytes,
        filename=file.filename,
        title=title,
        publisher_id=UUID(publisher_id) if publisher_id else None,
        document_category=document_category,
        administrative_level=administrative_level,
        fiscal_year=fiscal_year,
    )

    return UploadDocumentResponse(
        document_id=str(doc.id),
        title=doc.title or file.filename,
        publisher_id=str(doc.publisher_id) if doc.publisher_id else None,
        document_category=doc.document_category,
        administrative_level=doc.administrative_level,
        fiscal_year=doc.fiscal_year,
        chunk_count=doc.chunk_count,
        status="completed",
    )


@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str) -> DocumentResponse:
    """Get document details with publisher info."""
    service = get_service()
    doc = await service.get_document_with_publisher(UUID(document_id))

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentResponse(**doc)


@router.get("/documents/{document_id}/status")
async def get_document_status(document_id: str):
    """Get the processing status of a document."""
    service = get_service()
    doc = await service.find_document_by_id(UUID(document_id))

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "document_id": str(doc.id),
        "title": doc.title,
        "embedding_status": doc.embedding_status,
        "chunk_count": doc.chunk_count,
        "processing_status": doc.processing_status,
    }


# ============================================================================
# Semantic Search
# ============================================================================


@router.post("/search", response_model=SearchResponse)
async def semantic_search(request: SearchRequest) -> SearchResponse:
    """
    Perform semantic search across all documents.

    Returns document chunks ranked by similarity to the query.

    Optional filters:
    - publisher_id: Filter by publisher
    - document_category: budget, regulation, contract, report, minutes, announcement, other
    - administrative_level: municipal, regional, national, eu, other
    - min_reliability: Minimum publisher reliability score (0.0-1.0)
    """
    service = get_service()

    filters = None
    if request.filters:
        filters = request.filters.model_dump(exclude_none=True)

    results = await service.semantic_search(
        query=request.query,
        limit=request.limit,
        threshold=request.threshold,
        filters=filters,
    )

    return SearchResponse(
        query=request.query,
        results=[SearchResult(**r) for r in results],
        total=len(results),
    )


# ============================================================================
# RAG Chat
# ============================================================================


@router.post("/chat", response_model=ChatResponse)
async def chat_with_documents(request: ChatRequest) -> ChatResponse:
    """
    Chat with documents using RAG (Retrieval-Augmented Generation).

    The system will:
    1. Search for relevant document chunks (with optional filters)
    2. Include them as context
    3. Generate a response using Claude
    """
    service = get_service()

    # 1. Build filters from request
    filters = None
    if request.filters:
        filters = request.filters.model_dump(exclude_none=True)

    # 2. Retrieve relevant chunks
    context_chunks = settings.sources_app__chat_context_chunks
    search_results = await service.semantic_search(
        query=request.query,
        limit=context_chunks,
        threshold=0.5,
        filters=filters,
    )

    if not search_results:
        return ChatResponse(
            answer="I couldn't find any relevant information in the documents to answer your question.",
            sources=[],
        )

    # 3. Build context from chunks
    context_parts = []
    for i, result in enumerate(search_results, 1):
        source_info = result['document_title'] or 'Document'
        if result.get('publisher_name'):
            source_info = f"{source_info} ({result['publisher_name']})"
        context_parts.append(f"[Source {i}: {source_info}]\n{result['content']}")
    context = "\n\n---\n\n".join(context_parts)

    # 4. Generate response with Claude
    model = settings.sources_app__chat_model
    llm = init_chat_model(model=model, model_provider="anthropic")

    system_prompt = """You are a helpful assistant that answers questions based on the provided document context.

Rules:
1. Only answer based on the information in the provided context
2. If the context doesn't contain enough information, say so
3. Cite sources by referring to [Source N] when using information from that source
4. Be concise and accurate"""

    user_message = f"""Context from documents:

{context}

---

Question: {request.query}

Please answer the question based on the context above."""

    messages = [
        ("system", system_prompt),
        ("user", user_message),
    ]

    response = await llm.ainvoke(messages)

    return ChatResponse(
        answer=response.content,
        sources=[SearchResult(**r) for r in search_results] if request.include_sources else [],
    )
