#!/usr/bin/env python3
"""CLI tool to ingest documents into the RAG system.

Usage:
    python scripts/ingest.py <file_path> [display_name]

Examples:
    python scripts/ingest.py data/raw/report.pdf
    python scripts/ingest.py data/raw/sales.csv "Q4 Sales Data"
"""
import sys
from pathlib import Path

# Allow running from project root without installing the package
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from rag_agent.core.logging import setup_logging
from rag_agent.db.database import SessionLocal, create_tables
from rag_agent.ingestion.pipeline import IngestionPipeline


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    setup_logging()
    create_tables()

    file_path = sys.argv[1]
    name = sys.argv[2] if len(sys.argv) > 2 else None

    db = SessionLocal()
    try:
        doc_id = IngestionPipeline(db).ingest(file_path, name=name)
        print(f"Ingested successfully — doc_id={doc_id}")
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
