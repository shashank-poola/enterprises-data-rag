from langchain_groq import ChatGroq

from rag_agent.core.config import settings


def get_llm() -> ChatGroq:
    return ChatGroq(
        model=settings.llm_model,
        api_key=settings.groq_api_key,
        temperature=0,
    )
