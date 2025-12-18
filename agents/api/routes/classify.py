"""Classification endpoint."""

from fastapi import APIRouter

from api.models import ClassifyRequest, ClassifyResponse, ProvisionType
from api.services.classifier import classify_provision

router = APIRouter()


@router.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest) -> ClassifyResponse:
    """
    Classify a provision description into one of the 6 types.

    This is a quick LLM call (no tools) to suggest the provision type.
    """
    result = await classify_provision(
        description=request.description,
        entity_name=request.entity_name,
    )

    return ClassifyResponse(
        suggested_type=ProvisionType(result["suggested_type"]),
        confidence=result["confidence"],
        reasoning=result["reasoning"],
    )
