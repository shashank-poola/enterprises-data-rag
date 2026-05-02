from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # API keys
    groq_api_key: str
    gemini_api_key: str
    chroma_api_key: str
    chroma_tenant: str
    chroma_database: str

    # Model settings
    llm_model: str = "llama-3.3-70b-versatile"
    embedding_model: str = "models/text-embedding-004"
    chroma_collection: str = "enterprise_docs"

    # Chunking
    chunk_size: int = 1000
    chunk_overlap: int = 200

    # Retrieval
    retrieval_k: int = 5

    # SQLite metadata store
    database_url: str = "sqlite:///./data/rag_agent.db"

    # App
    app_name: str = "Enterprise RAG Agent"
    app_version: str = "0.1.0"
    debug: bool = False


settings = Settings()
