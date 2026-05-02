"use client";

import { useCallback, useRef, useState } from "react";
import { streamQuery } from "@/lib/api";
import type { Message, SourceDocument, ThinkingStep } from "@/types";

function nanoid() {
  return Math.random().toString(36).slice(2);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ThinkingSteps({ steps }: { steps: ThinkingStep[] }) {
  const [open, setOpen] = useState(false);
  if (!steps.length) return null;
  return (
    <div className="mt-2 mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
      >
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {open ? "Hide" : "Show"} reasoning ({steps.length} steps)
      </button>
      {open && (
        <div className="mt-2 pl-4 border-l-2 border-stone-200 space-y-1.5">
          {steps.map((s, i) => (
            <p key={i} className="text-xs text-stone-500">{s.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function SourcesPanel({ sources }: { sources: SourceDocument[] }) {
  const [open, setOpen] = useState(false);
  if (!sources.length) return null;
  return (
    <div className="mt-3 pt-3 border-t border-stone-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {sources.length} source{sources.length !== 1 ? "s" : ""}
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {sources.map((s, i) => (
            <div key={i} className="bg-stone-50 rounded-lg p-3 text-xs">
              {s.document_name && (
                <p className="font-medium text-stone-600 mb-1 truncate">{s.document_name}</p>
              )}
              <p className="text-stone-500 line-clamp-3">{s.content}</p>
              {s.rerank_score != null && (
                <p className="text-stone-400 mt-1">Score: {s.rerank_score.toFixed(3)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] ${isUser ? "order-1" : ""}`}>
        {isUser ? (
          <div className="bg-stone-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-stone-800">
            {message.thinking && <ThinkingSteps steps={message.thinking} />}
            <div className="whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-stone-400 rounded-sm ml-0.5 animate-pulse align-text-bottom" />
              )}
            </div>
            {!message.isStreaming && message.sources && (
              <SourcesPanel sources={message.sources} />
            )}
            {message.latency_ms != null && !message.isStreaming && (
              <p className="text-xs text-stone-400 mt-2">{message.latency_ms}ms</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-500">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h2 className="text-base font-medium text-stone-700 mb-1">Ask your data anything</h2>
      <p className="text-sm text-stone-400 max-w-xs">
        Use hybrid BM25 + semantic search with Cohere reranking to get precise answers from your documents.
      </p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || streaming) return;

    setInput("");
    const userMsg: Message = { id: nanoid(), role: "user", content: question };
    const assistantId = nanoid();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      thinking: [],
      sources: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);
    scrollToBottom();

    let fullContent = "";
    const thinking: ThinkingStep[] = [];
    let sources: SourceDocument[] = [];
    let latency_ms: number | undefined;

    try {
      for await (const event of streamQuery(question)) {
        if (event.event === "thinking") {
          thinking.push({ step: event.step, message: event.message });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, thinking: [...thinking] } : m
            )
          );
        } else if (event.event === "sources") {
          sources = event.documents;
        } else if (event.event === "token") {
          fullContent += event.content;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: fullContent } : m
            )
          );
          scrollToBottom();
        } else if (event.event === "done") {
          latency_ms = event.latency_ms;
        } else if (event.event === "error") {
          fullContent = `Error: ${event.message}`;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: fullContent } : m
            )
          );
        }
      }
    } finally {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: fullContent, thinking, sources, latency_ms, isStreaming: false }
            : m
        )
      );
      setStreaming(false);
      scrollToBottom();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
        <h1 className="font-semibold text-stone-900">Chat</h1>
        <button
          onClick={() => setMessages([])}
          className="text-xs text-stone-500 hover:text-stone-700 transition-colors"
        >
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 shrink-0">
        <form onSubmit={sendMessage} className="flex items-end gap-3 bg-white border border-stone-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-stone-900 focus-within:border-transparent transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Ask a question about your data…"
            rows={1}
            className="flex-1 resize-none text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none leading-relaxed max-h-40 overflow-y-auto"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center transition-colors hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {streaming ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-xs text-stone-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
