import React, { useState } from "react";
import { Camera, FileCode, CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";
import { ApprovalItem } from "@oomnieye/shared";

interface ItemPreviewPanelProps {
  item: ApprovalItem | null;
}

export const ItemPreviewPanel: React.FC<ItemPreviewPanelProps> = ({ item }) => {
  const [activeTab, setActiveTab] = useState<"snapshot" | "media">("snapshot");

  if (!item) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col items-center justify-center text-slate-400 min-h-[380px]">
        <FileCode className="w-10 h-10 mb-2 stroke-slate-300" />
        <p className="text-xs font-medium">
          Select an approval item to inspect telemetry and snapshots
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Header & Tabs */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            {item.type} Target Review
          </span>
          <h2 className="text-sm font-bold text-slate-900 mt-1.5">{item.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-100 px-4 bg-slate-50/50 text-xs">
        <button
          onClick={() => setActiveTab("snapshot")}
          className={`py-2 px-3 font-semibold border-b-2 transition-all ${
            activeTab === "snapshot"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Snapshot & Control
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`py-2 px-3 font-semibold border-b-2 transition-all ${
            activeTab === "media"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Media / Content
        </button>
      </div>

      {/* Snapshot Preview Body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>Screen Snapshot Target</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">1920x1080 @ 60FPS</span>
        </div>

        {/* Mock Digital-Twin Overlay Box */}
        <div className="relative flex-1 min-h-[220px] bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

          {/* Bounding Box Overlay matching screenshot */}
          <div className="absolute inset-8 border-2 border-dashed border-purple-400/80 rounded-md bg-purple-500/10 flex flex-col justify-between p-3 pointer-events-none">
            <div className="flex justify-between items-center text-[10px] font-mono text-purple-300">
              <span className="bg-purple-900/80 px-1.5 py-0.5 rounded border border-purple-400/40">
                ZONE_B4 [OK]
              </span>
              <span>FOV: 94.2°</span>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-white tracking-wide">{item.name}</div>
              <div className="text-[10px] text-purple-200 mt-0.5">
                Submitted by {item.submittedBy} · {item.date}
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-emerald-400 font-mono">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>TELEMETRY_SYNCED</span>
              </span>
              <span>ALT: 28.4m</span>
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium text-[11px]">
              Compliance Policy: Requires 60fps verification and ISO 9001 check
            </span>
          </div>
          <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 shrink-0">
            Quick Verify
          </button>
        </div>
      </div>
    </div>
  );
};
