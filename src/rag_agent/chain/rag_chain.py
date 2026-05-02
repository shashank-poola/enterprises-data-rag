import time

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from rag_agent.generation.llm import get_llm
from rag_agent.generation.prompts import ENTERPRISE_RAG_PROMPT
from rag_agent.retrieval.retriever import get_retriever
from rag_agent.schemas.query import QueryResponse, SourceDocument


def _format_docs(docs: list[Document]) -> str:
    return "\n\n---\n\n".join(doc.page_content for doc in docs)


class RAGChain:
    def __init__(self, k: int | None = None):
        self.retriever = get_retriever(k)
        self._chain = (
            {
                "context": self.retriever | _format_docs,
                "question": RunnablePassthrough(),
            }
            | ENTERPRISE_RAG_PROMPT
            | get_llm()
            | StrOutputParser()
        )

    def query(self, question: str, k: int | None = None) -> QueryResponse:
        if k:
            self.retriever.search_kwargs["k"] = k

        start = time.monotonic()
        retrieved_docs = self.retriever.invoke(question)
        answer = self._chain.invoke(question)
        latency_ms = int((time.monotonic() - start) * 1000)

        sources = [
            SourceDocument(
                document_id=doc.metadata.get("doc_id"),
                document_name=doc.metadata.get("doc_name"),
                content=doc.page_content[:400],
                score=doc.metadata.get("score"),
            )
            for doc in retrieved_docs
        ]

        return QueryResponse(
            question=question,
            answer=answer,
            sources=sources,
            latency_ms=latency_ms,
        )
