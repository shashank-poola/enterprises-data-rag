import chromadb
from langchain_chroma import Chroma

from rag_agent.core.config import settings
from rag_agent.embeddings.embedder import get_embeddings


def get_chroma_client() -> chromadb.CloudClient:
    return chromadb.CloudClient(
        tenant=settings.chroma_tenant,
        database=settings.chroma_database,
        api_key=settings.chroma_api_key,
    )


def get_vector_store() -> Chroma:
    client = get_chroma_client()
    return Chroma(
        client=client,
        collection_name=settings.chroma_collection,
        embedding_function=get_embeddings(),
    )
