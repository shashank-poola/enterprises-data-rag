from langchain_core.vectorstores import VectorStoreRetriever

from rag_agent.core.config import settings
from rag_agent.vectorstore.chroma_store import get_vector_store


def get_retriever(k: int | None = None) -> VectorStoreRetriever:
    vector_store = get_vector_store()
    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k or settings.retrieval_k},
    )
