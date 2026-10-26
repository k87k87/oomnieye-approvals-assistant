import React from "react";
import { Bot, RotateCw, X, Minus } from "lucide-react";
import { useAssistantStore } from "../../store/useAssistantStore";

interface AssistantHeaderProps {
  onClose: () => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({ onClose }) => {
  const { loadGreeting, isGreetingLoading, activeView, backToCards } = useAssistantStore();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 flex items-center justify-between rounded-t-2xl border-b border-indigo-900/50 shadow-sm select-none">
      {/* Title & Avatar */}
      <div className="flex items-center space-x-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-xs tracking-wide">Approvals Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950/80 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-300">Live Decision & Policy Engine</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1.5">
        {/* Replay Greeting Button */}
        <button
          onClick={() => loadGreeting()}
          disabled={isGreetingLoading}
          title="Replay Greeting (Context-Aware Regeneration)"
          className="flex items-center space-x-1 px-2 py-1 text-[11px] font-medium text-slate-200 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-md transition-all border border-white/10 disabled:opacity-50"
        >
          <RotateCw
            className={`w-3 h-3 ${isGreetingLoading ? "animate-spin text-cyan-300" : ""}`}
          />
          <span className="hidden sm:inline">Replay Greeting</span>
        </button>

        {/* Back / Minimize */}
        {activeView !== "cards" && (
          <button
            onClick={() => backToCards()}
            title="Back to Actions"
            className="p-1 hover:bg-white/15 rounded-md text-slate-300 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          title="Close Assistant Widget"
          className="p-1 hover:bg-white/15 rounded-md text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
