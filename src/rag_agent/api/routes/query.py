import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from rag_agent.chain.rag_chain import RAGChain
from rag_agent.db.database import get_db
from rag_agent.db.repository import QueryLogRepository
from rag_agent.schemas.query import QueryRequest, QueryResponse

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse)
def query(request: QueryRequest, db: Session = Depends(get_db)):
    try:
        result = RAGChain(k=request.k).query(request.question)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    source_ids = json.dumps([s.document_id for s in result.sources if s.document_id])
    QueryLogRepository(db).create(
        query=request.question,
        response=result.answer,
        source_documents=source_ids,
        latency_ms=result.latency_ms,
    )

    return result


@router.get("/history")
def query_history(limit: int = 50, db: Session = Depends(get_db)):
    return QueryLogRepository(db).list_recent(limit)
