# DataMind — Enterprise RAG

AI-powered document intelligence. Upload your documents, ask questions, get precise answers backed by sources.

Built with hybrid BM25 + semantic search, Cohere reranking, and a streaming reasoning UI.

---

## How It Works

```
Document Upload
      │
      ▼
  Chunking (1000 tokens, 200 overlap)
      │
      ├──► BM25 Index (keyword)
      └──► ChromaDB (vector embeddings via Gemini)
                        │
               Query comes in
                        │
              ┌─────────┴──────────┐
         BM25 (0.4)        Vector (0.6)
              └─────────┬──────────┘
                   Ensemble merge
                        │
               Cohere Reranker
                        │
              Groq LLM (Llama 3.3 70B)
                        │
               Streamed response + sources
```

---

## Stack

| Layer | Technology |
|---|---|
| LLM | Groq — `llama-3.3-70b-versatile` |
| Embeddings | Google Gemini — `gemini-embedding-001` |
| Vector Store | ChromaDB Cloud |
| Keyword Search | BM25 (`rank-bm25`) |
| Reranker | Cohere — `rerank-english-v3.0` |
| Backend | FastAPI, LangChain, SQLAlchemy |
| Auth | JWT (`python-jose`) |
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Font | Onest (Google Fonts) |
| Icons | Nucleo Glass |

---

## Features

- **Hybrid retrieval** — BM25 keyword search + semantic vector search, merged and reranked
- **Streaming reasoning** — watch the agent reason step-by-step in real time via SSE
- **Document management** — upload PDF, CSV, TXT; track indexing status per document
- **Source attribution** — every answer shows retrieved chunks with rerank scores
- **Auth** — JWT-based login/signup with protected routes
- **Analytics** — query history and usage insights dashboard

---

## Project Structure

```
rag-agent/
├── main.py                    # Uvicorn entrypoint (:8000)
├── pyproject.toml             # Python deps (managed with uv)
├── src/rag_agent/
│   ├── api/
│   │   ├── app.py             # FastAPI app, CORS, router registration
│   │   ├── routes/
│   │   │   ├── auth.py        # /api/v1/auth/*
│   │   │   ├── documents.py   # /api/v1/documents/*
│   │   │   ├── query.py       # /api/v1/query/stream
│   │   │   └── analytics.py   # /api/v1/analytics/*
│   │   └── dependencies.py    # Auth dependency injection
│   ├── core/
│   │   ├── config.py          # Pydantic settings + env vars
│   │   └── security.py        # JWT encode/decode
│   ├── db/
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   ├── models.py          # ORM models
│   │   └── repository.py      # DB query layer
│   ├── ingestion/             # PDF, CSV, TXT loaders + chunking
│   ├── embeddings/            # Gemini embedding wrapper
│   ├── vectorstore/           # ChromaDB Cloud client
│   ├── retrieval/
│   │   ├── hybrid_retriever.py  # BM25 + vector ensemble
│   │   ├── bm25_retriever.py
│   │   ├── reranker.py          # Cohere rerank
│   │   └── retriever.py
│   ├── generation/            # LLM wrapper + prompt templates
│   ├── chain/                 # RAG chain + streaming logic
│   └── schemas/               # Pydantic request/response models
└── web/                       # Next.js 16 frontend
    └── src/
        ├── app/               # App router pages
        ├── components/
        │   ├── Sidebar.tsx
        │   └── chat/          # ChatWindow, ChatInput, MessageBubble, ThinkingSteps, SourcesPanel
        ├── hooks/             # useChat, useDocuments, useAnalytics
        ├── lib/api/           # Typed API clients + SSE stream parser
        └── types/             # Shared TypeScript types
```

---

## Setup

### Prerequisites

- Python 3.12+
- Node.js 18+
- [`uv`](https://docs.astral.sh/uv/) for Python package management

### 1. Clone & install

```bash
git clone https://github.com/yourname/rag-agent.git
cd rag-agent
```

**Backend:**
```bash
uv sync
```

**Frontend:**
```bash
cd web && npm install
```

### 2. Environment variables

Create `.env` in the project root:

```env
# LLM
GROQ_API_KEY=your_groq_api_key
LLM_MODEL=llama-3.3-70b-versatile

# Embeddings
GEMINI_API_KEY=your_gemini_api_key
EMBEDDING_MODEL=gemini-embedding-001

# Reranking
COHERE_API_KEY=your_cohere_api_key
COHERE_RERANK_MODEL=rerank-english-v3.0

# Vector Store (ChromaDB Cloud)
CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_tenant
CHROMA_DATABASE=your_database
CHROMA_COLLECTION=your_collection

# Auth
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./datamind.db

# Retrieval weights (optional — these are defaults)
BM25_WEIGHT=0.4
VECTOR_WEIGHT=0.6
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run

**Backend:**
```bash
uv run python main.py
```

**Frontend:**
```bash
cd web && npm run dev
# → http://localhost:3000
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | Register new user |
| `POST` | `/api/v1/auth/login` | Login, returns JWT |
| `GET` | `/api/v1/documents` | List uploaded documents |
| `POST` | `/api/v1/documents/upload` | Upload document (PDF/CSV/TXT) |
| `DELETE` | `/api/v1/documents/{id}` | Delete document |
| `POST` | `/api/v1/query/stream` | Stream RAG query (SSE) |
| `GET` | `/api/v1/analytics` | Query analytics |
| `GET` | `/health` | Health check |

### Streaming query events

`POST /api/v1/query/stream` returns a Server-Sent Events stream:

```
data: {"event": "thinking", "step": "retrieve",  "message": "Searching documents..."}
data: {"event": "sources",  "documents": [...]}
data: {"event": "token",    "content": "The answer is..."}
data: {"event": "done",     "latency_ms": 1842}
data: {"event": "error",    "message": "..."}
```

---

## Retrieval Details

**Hybrid search** runs BM25 and vector search in parallel, then merges using a weighted ensemble:

```
final_score = (BM25_score × 0.4) + (vector_score × 0.6)
```

Falls back to vector-only if no BM25 index exists yet.

**Reranking** passes merged candidate chunks to Cohere's cross-encoder alongside the original query. The reranker scores each chunk in context of the full query — significantly more precise than cosine similarity alone.

---

## Supported Document Types

| Type | Notes |
|---|---|
| `.pdf` | Text extraction, multi-page |
| `.csv` | Row-level chunking |
| `.txt` | Plain text chunking |

---

## License

MIT
