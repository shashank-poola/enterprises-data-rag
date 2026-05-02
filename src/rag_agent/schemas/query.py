from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000)
    k: int = Field(default=5, ge=1, le=20)


class SourceDocument(BaseModel):
    document_id: str | None = None
    document_name: str | None = None
    content: str
    score: float | None = None


class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: list[SourceDocument]
    latency_ms: int
