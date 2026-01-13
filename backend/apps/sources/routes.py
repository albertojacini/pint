"""API routes for the sources app."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from langchain.chat_models import init_chat_model

from apps.sources.models import (
    ChatRequest,
    ChatResponse,
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
# Document Upload & Processing
# ============================================================================


@router.post("/documents/upload", response_model=UploadDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    publisher_id: Optional[str] = Form(None),
) -> UploadDocumentResponse:
    """
    Upload a PDF document for processing.

    The document will be:
    1. Parsed using pdfplumber
    2. Split into chunks
    3. Embedded using OpenAI
    4. Stored for semantic search

    This is a synchronous endpoint - waits for processing to complete.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()

    # Limit file size to 50MB for reasonable processing time
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
    )

    return UploadDocumentResponse(
        document_id=str(doc.id),
        title=doc.title or file.filename,
        chunk_count=doc.chunk_count,
        status="completed",
    )


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
    """
    service = get_service()

    results = await service.semantic_search(
        query=request.query,
        limit=request.limit,
        threshold=request.threshold,
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
    1. Search for relevant document chunks
    2. Include them as context
    3. Generate a response using Claude
    """
    service = get_service()

    # 1. Retrieve relevant chunks
    search_results = await service.semantic_search(
        query=request.query,
        limit=5,
        threshold=0.5,
    )

    if not search_results:
        return ChatResponse(
            answer="I couldn't find any relevant information in the documents to answer your question.",
            sources=[],
        )

    # 2. Build context from chunks
    context_parts = []
    for i, result in enumerate(search_results, 1):
        context_parts.append(f"[Source {i}: {result['document_title'] or 'Document'}]\n{result['content']}")
    context = "\n\n---\n\n".join(context_parts)

    # 3. Generate response with Claude
    llm = init_chat_model(model="claude-sonnet-4-5", model_provider="anthropic")

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
