import React from "react";
import { FilePieChart, MessagesSquare, HelpCircle, GraduationCap, ArrowRight } from "lucide-react";
import { useAssistantStore } from "../../store/useAssistantStore";
import { ActionType } from "@oomnieye/shared";

interface ActionCardConfig {
  id: ActionType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  gradient: string;
}

export const ActionCardsGrid: React.FC = () => {
  const { startAction, isStreaming, isSummaryLoading } = useAssistantStore();

  const cards: ActionCardConfig[] = [
    {
      id: "summary",
      title: "Present me Summary",
      subtitle: "Prioritized urgency ranking and risk synthesis across queue items",
      icon: <FilePieChart className="w-5 h-5 text-indigo-600" />,
      badge: "Urgency Ranked",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      gradient: "hover:border-indigo-300 hover:shadow-indigo-500/10",
    },
    {
      id: "talk",
      title: "Talk to me",
      subtitle: "Multi-turn dialogue (e.g., 'Which item needs attention first?')",
      icon: <MessagesSquare className="w-5 h-5 text-blue-600" />,
      badge: "Free-form Q&A",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      gradient: "hover:border-blue-300 hover:shadow-blue-500/10",
    },
    {
      id: "help",
      title: "Help me",
      subtitle: "Operational answers grounded strictly in approval & maintenance policy",
      icon: <HelpCircle className="w-5 h-5 text-emerald-600" />,
      badge: "Grounded RAG",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      gradient: "hover:border-emerald-300 hover:shadow-emerald-500/10",
    },
    {
      id: "teach",
      title: "Teach me",
      subtitle: "Step-by-step interactive onboarding for new operators",
      icon: <GraduationCap className="w-5 h-5 text-purple-600" />,
      badge: "4-Step SOP",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      gradient: "hover:border-purple-300 hover:shadow-purple-500/10",
    },
  ];

  const isLoading = isStreaming || isSummaryLoading;

  return (
    <div className="p-4 space-y-3">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Choose an AI Decision Action
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {cards.map((card) => (
          <button
            key={card.id}
            disabled={isLoading}
            onClick={() => startAction(card.id)}
            className={`group text-left p-3 rounded-xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[105px] disabled:opacity-50 ${card.gradient}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                  {card.icon}
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              </div>

              <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                {card.title}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                {card.subtitle}
              </p>
            </div>

            <div className="mt-2.5 flex items-center space-x-1 text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
