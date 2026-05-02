from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from rag_agent.api.dependencies import get_current_user
from rag_agent.db.database import get_db
from rag_agent.db.models import Document, QueryLog

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total_docs = db.query(func.count(Document.id)).scalar() or 0
    indexed_docs = db.query(func.count(Document.id)).filter(Document.status == "indexed").scalar() or 0
    total_queries = db.query(func.count(QueryLog.id)).scalar() or 0

    recent_logs = db.query(QueryLog).order_by(QueryLog.created_at.desc()).limit(100).all()
    avg_latency = int(sum(l.latency_ms for l in recent_logs) / len(recent_logs)) if recent_logs else 0

    recent_queries = [
        {
            "id": l.id,
            "query": l.query,
            "latency_ms": l.latency_ms,
            "created_at": l.created_at.isoformat(),
        }
        for l in recent_logs[:10]
    ]

    return {
        "total_documents": total_docs,
        "indexed_documents": indexed_docs,
        "total_queries": total_queries,
        "avg_latency_ms": avg_latency,
        "recent_queries": recent_queries,
    }
