import React from "react";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import { useAssistantStore } from "../../store/useAssistantStore";
import { UrgencyLevel } from "@oomnieye/shared";

export const StructuredSummaryView: React.FC = () => {
  const { structuredSummary, isSummaryLoading, backToCards, errorMessage, startAction } =
    useAssistantStore();

  if (isSummaryLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-9 h-9 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-xs font-semibold text-slate-800">
          Synthesizing approvals telemetry...
        </div>
        <p className="text-[11px] text-slate-500 max-w-xs">
          Validating structured JSON schemas and calculating urgency ratings.
        </p>
      </div>
    );
  }

  if (errorMessage && !structuredSummary) {
    return (
      <div className="p-5 text-center space-y-3">
        <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
          <p className="font-semibold">Unable to generate structured summary</p>
          <p className="text-[11px] mt-1">{errorMessage}</p>
        </div>
        <button
          onClick={backToCards}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
        >
          Back to Actions
        </button>
      </div>
    );
  }

  if (!structuredSummary) return null;

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case "HIGH":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>HIGH URGENCY</span>
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>MEDIUM</span>
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            <span>LOW</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 space-y-4 max-h-[460px] overflow-y-auto">
      {/* Header with Back button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          onClick={backToCards}
          className="flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Action Cards</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
            {structuredSummary.highPriorityCount} Urgent
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {structuredSummary.totalPending} Total
          </span>
        </div>
      </div>

      {/* Degradation / Fallback Notice */}
      {structuredSummary.degraded && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold">Deterministic Policy Fallback: </span>
            {structuredSummary.fallbackReason ||
              "8s timeout threshold reached. Queue prioritized via rule-based safety criteria."}
          </div>
        </div>
      )}

      {/* Overview Paragraph */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
        <span className="font-bold text-slate-900 block mb-0.5">Executive Queue Synthesis</span>
        {structuredSummary.overview}
      </div>

      {/* Prioritized Items List */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Ranked Approvals by Urgency
        </div>

        {structuredSummary.prioritizedItems.map((item, idx) => (
          <div
            key={item.itemId || idx}
            className={`p-3 rounded-xl border transition-all text-xs ${
              item.urgency === "HIGH"
                ? "bg-rose-50/30 border-rose-200 shadow-xs"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold text-slate-900">{item.itemName}</div>
              {getUrgencyBadge(item.urgency)}
            </div>

            <p className="text-[11.5px] text-slate-600 mt-1.5 leading-snug">
              <span className="font-semibold text-slate-700">Operational Risk: </span>
              {item.reason}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                <span className="font-semibold text-slate-700">Action: </span>
                {item.recommendedAction}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Recommendation Banner */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-xs">
        <div className="flex items-start space-x-2">
          <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-950 block text-[11px]">
              Top Recommended Operator Action
            </span>
            <p className="text-blue-900 mt-0.5 text-[11.5px] leading-relaxed">
              {structuredSummary.topRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Follow-up Prompts */}
      <div className="pt-2 flex flex-wrap gap-1.5">
        <button
          onClick={() =>
            startAction(
              "talk",
              "Explain why the Level 2 Drone Video has the highest urgency rating?",
            )
          }
          className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors"
        >
          Ask: Why is Drone Video highest urgency?
        </button>
        <button
          onClick={() =>
            startAction("help", "What are the specific rejection criteria for sensor specs?")
          }
          className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors"
        >
          Policy: Sensor rejection criteria
        </button>
      </div>
    </div>
  );
};
