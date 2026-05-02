import { useCallback, useRef, useState } from "react";
import { streamQuery } from "@/lib/api/query";
import { nanoid } from "@/lib/utils";
import type { Message, SourceDocument, ThinkingStep } from "@/types";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || streaming) return;

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
    },
    [streaming, scrollToBottom]
  );

  return { messages, streaming, bottomRef, sendMessage, clearMessages };
}
