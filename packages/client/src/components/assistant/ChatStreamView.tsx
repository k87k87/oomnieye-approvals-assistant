import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, User, Send, ShieldAlert, Bookmark, Loader2 } from "lucide-react";
import { useAssistantStore } from "../../store/useAssistantStore";

export const ChatStreamView: React.FC = () => {
  const {
    messages,
    streamingTokenBuffer,
    isStreaming,
    isDegraded,
    currentCitations,
    activeAction,
    backToCards,
    sendMessage,
    errorMessage,
  } = useAssistantStore();

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingTokenBuffer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isStreaming) return;
    sendMessage(inputVal);
    setInputVal("");
  };

  const getActionTitle = () => {
    switch (activeAction) {
      case "talk":
        return "Talk to me · Conversational Reasoning";
      case "help":
        return "Help me · Grounded Policy Assistant";
      case "teach":
        return "Teach me · Operator Training Walkthrough";
      default:
        return "AI Approvals Assistant";
    }
  };

  return (
    <div className="flex flex-col h-[460px]">
      {/* Subheader with Back Button */}
      <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
        <button
          onClick={backToCards}
          className="flex items-center space-x-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Actions</span>
        </button>

        <span className="font-bold text-[11px] text-slate-700 truncate max-w-[200px]">
          {getActionTitle()}
        </span>

        {isStreaming ? (
          <span className="flex items-center space-x-1 text-[10px] text-blue-600 font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Streaming</span>
          </span>
        ) : isDegraded ? (
          <span className="flex items-center space-x-1 text-[10px] text-amber-600 font-medium">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>Degraded</span>
          </span>
        ) : (
          <span className="text-[10px] text-emerald-600 font-semibold">Ready</span>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                  isUser
                    ? "bg-slate-800 text-white"
                    : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  isUser
                    ? "bg-blue-600 text-white rounded-br-none shadow-xs"
                    : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounding Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex flex-wrap gap-1">
                    {msg.citations.map((cite, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                      >
                        <Bookmark className="w-2.5 h-2.5" />
                        <span>{cite}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp & Degraded Warning */}
                <div className="mt-1 flex items-center justify-between text-[9px] opacity-70">
                  <span>{msg.timestamp}</span>
                  {msg.degraded && (
                    <span className="text-amber-700 font-semibold flex items-center space-x-0.5">
                      <ShieldAlert className="w-2.5 h-2.5" />
                      <span>Policy Fallback</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Token-by-Token Streaming Bubble */}
        {isStreaming && (
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>

            <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60">
              <div className="whitespace-pre-wrap streaming-cursor">
                {streamingTokenBuffer || "..."}
              </div>

              {currentCitations && currentCitations.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex flex-wrap gap-1">
                  {currentCitations.map((cite, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center space-x-1 text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                    >
                      <Bookmark className="w-2.5 h-2.5" />
                      <span>{cite}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback / Error banner if stream failed */}
        {errorMessage && (
          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
            {errorMessage}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar for Multi-Turn Dialog */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 border-t border-slate-200/80 bg-white flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={
            activeAction === "help"
              ? "Ask an operational policy question..."
              : activeAction === "teach"
                ? "Ask a follow-up about the review procedure..."
                : "Ask about pending items, urgency, or next steps..."
          }
          disabled={isStreaming}
          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isStreaming}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
