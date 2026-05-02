from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    name: str
    source: str
    file_type: str
    status: str
    chunk_count: int
    error: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
