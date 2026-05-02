from pathlib import Path

from langchain_community.document_loaders import CSVLoader
from langchain_core.documents import Document


def load_csv(file_path: str | Path) -> list[Document]:
    loader = CSVLoader(file_path=str(file_path), encoding="utf-8")
    return loader.load()
