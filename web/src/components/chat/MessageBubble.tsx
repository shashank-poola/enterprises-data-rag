import type { Message } from "@/types";
import { SourcesPanel } from "./SourcesPanel";
import { ThinkingSteps } from "./ThinkingSteps";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-stone-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[75%] bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-stone-800">
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
    </div>
  );
}
