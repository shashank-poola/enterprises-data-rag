"use client";

import { useState } from "react";
import type { ThinkingStep } from "@/types";

export function ThinkingSteps({ steps }: { steps: ThinkingStep[] }) {
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
