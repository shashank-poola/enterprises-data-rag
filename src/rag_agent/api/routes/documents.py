import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from rag_agent.api.dependencies import get_current_user
from rag_agent.db.database import get_db
from rag_agent.db.models import User
from rag_agent.db.repository import DocumentRepository
from rag_agent.ingestion.pipeline import IngestionPipeline, SUPPORTED_EXTENSIONS
from rag_agent.schemas.document import DocumentListResponse, DocumentResponse

router = APIRouter(prefix="/documents", tags=["documents"])

_UPLOAD_DIR = Path("data/uploads")
_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{suffix}'. Supported: {SUPPORTED_EXTENSIONS}",
        )

    dest = _UPLOAD_DIR / file.filename
    with dest.open("wb") as buf:
        shutil.copyfileobj(file.file, buf)

    pipeline = IngestionPipeline(db)
    try:
        doc_id = pipeline.ingest(dest, name=file.filename)
    except Exception as exc:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {exc}")

    return DocumentRepository(db).get(doc_id)


@router.get("", response_model=DocumentListResponse)
def list_documents(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    docs = DocumentRepository(db).list_all()
    return DocumentListResponse(documents=docs, total=len(docs))


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    doc = DocumentRepository(db).get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{doc_id}", status_code=204)
def delete_document(doc_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    if not DocumentRepository(db).delete(doc_id):
        raise HTTPException(status_code=404, detail="Document not found")
