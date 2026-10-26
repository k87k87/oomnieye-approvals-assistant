"use client";

import React, { useEffect } from "react";
import { Bot } from "lucide-react";
import { useAssistantStore } from "../../store/useAssistantStore";
import { AssistantHeader } from "./AssistantHeader";
import { GreetingBanner } from "./GreetingBanner";
import { ActionCardsGrid } from "./ActionCardsGrid";
import { StructuredSummaryView } from "./StructuredSummaryView";
import { ChatStreamView } from "./ChatStreamView";

export const AssistantWidget: React.FC = () => {
  const { isWidgetOpen, toggleWidget, activeView, loadGreeting } = useAssistantStore();

  // Load context-aware dynamic greeting on initial mount
  useEffect(() => {
    loadGreeting();
  }, [loadGreeting]);

  if (!isWidgetOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => toggleWidget(true)}
          className="group flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-full shadow-2xl hover:shadow-indigo-500/25 border border-indigo-700/40 transition-all hover:scale-105 active:scale-95"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-wide">Approvals Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[92vw] sm:w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col transition-all">
      {/* Top Header */}
      <AssistantHeader onClose={() => toggleWidget(false)} />

      {/* Main Panel Content Area */}
      <div className="flex-1 bg-white">
        {activeView === "cards" && (
          <>
            <GreetingBanner />
            <ActionCardsGrid />
          </>
        )}

        {activeView === "summary" && <StructuredSummaryView />}

        {activeView === "chat" && <ChatStreamView />}
      </div>
    </div>
  );
};
