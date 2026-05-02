export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  name: string;
  source: string;
  file_type: string;
  status: "pending" | "indexing" | "indexed" | "failed";
  chunk_count: number;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourceDocument {
  document_id: string | null;
  document_name: string | null;
  content: string;
  rerank_score: number | null;
}

export interface ThinkingStep {
  step: string;
  message: string;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: SourceDocument[];
  thinking?: ThinkingStep[];
  latency_ms?: number;
  isStreaming?: boolean;
}

export interface AnalyticsSummary {
  total_documents: number;
  indexed_documents: number;
  total_queries: number;
  avg_latency_ms: number;
  recent_queries: RecentQuery[];
}

export interface RecentQuery {
  id: string;
  query: string;
  latency_ms: number;
  created_at: string;
}
