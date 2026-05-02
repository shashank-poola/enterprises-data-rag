"use client";

import { useState } from "react";
import type { SourceDocument } from "@/types";

export function SourcesPanel({ sources }: { sources: SourceDocument[] }) {
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
