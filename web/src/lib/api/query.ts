import type { SourceDocument } from "@/types";
import { authHeader } from "./client";

export type StreamEvent =
  | { event: "thinking"; step: string; message: string }
  | { event: "sources"; documents: SourceDocument[] }
  | { event: "token"; content: string }
  | { event: "done"; latency_ms: number }
  | { event: "error"; message: string };

export async function* streamQuery(
  question: string,
  k = 5
): AsyncGenerator<StreamEvent> {
  const res = await fetch("/api/v1/query/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ question, k }),
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ detail: "Stream failed" }));
    yield { event: "error", message: err.detail };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          yield JSON.parse(line.slice(6)) as StreamEvent;
        } catch {
          // malformed line — skip
        }
      }
    }
  }
}
