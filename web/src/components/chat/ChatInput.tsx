"use client";

import { useState } from "react";

interface Props {
  onSend: (question: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || disabled) return;
    onSend(question);
    setInput("");
  }

  return (
    <div className="px-6 pb-6 pt-3 shrink-0">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 bg-white border border-stone-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-stone-900 focus-within:border-transparent transition-all"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Ask a question about your data…"
          rows={1}
          className="flex-1 resize-none text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none leading-relaxed max-h-40 overflow-y-auto"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center transition-colors hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {disabled ? (
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
      <p className="text-xs text-stone-400 text-center mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
