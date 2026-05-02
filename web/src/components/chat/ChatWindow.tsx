"use client";

import { useChat } from "@/hooks/useChat";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-500">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h2 className="text-base font-medium text-stone-700 mb-1">Ask your data anything</h2>
      <p className="text-sm text-stone-400 max-w-xs">
        Hybrid BM25 + semantic search with Cohere reranking delivers precise answers from your indexed documents.
      </p>
    </div>
  );
}

export function ChatWindow() {
  const { messages, streaming, bottomRef, sendMessage, clearMessages } = useChat();

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
        <h1 className="font-semibold text-stone-900">Chat</h1>
        <button
          onClick={clearMessages}
          className="text-xs text-stone-500 hover:text-stone-700 transition-colors"
        >
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={sendMessage} disabled={streaming} />
    </div>
  );
}
