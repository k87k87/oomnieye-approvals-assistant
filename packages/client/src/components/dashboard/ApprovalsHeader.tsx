import React from "react";
import { ArrowLeft, Info, Search, Plus, ListFilter, Network } from "lucide-react";

interface ApprovalsHeaderProps {
  totalItems: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeViewMode: "queue" | "hierarchy";
  onViewModeChange: (mode: "queue" | "hierarchy") => void;
}

export const ApprovalsHeader: React.FC<ApprovalsHeaderProps> = ({
  totalItems,
  searchQuery,
  onSearchChange,
  activeViewMode,
  onViewModeChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Back Link & Title */}
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Approvals & Review</h1>
            <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
          </div>
        </div>

        {/* Right Search & Add Help Button */}
        <div className="flex items-center space-x-3">
          <div className="relative w-72 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search approvals by title, author, folder, or page..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            />
          </div>

          <button className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all shadow-purple-500/20">
            <Plus className="w-3.5 h-3.5" />
            <span>Add help</span>
          </button>
        </div>
      </div>

      {/* View Subheader & Toggle Pills */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
            Pending Approval Requests
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {totalItems} items
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onViewModeChange("queue")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeViewMode === "queue"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Queue View</span>
          </button>

          <button
            onClick={() => onViewModeChange("hierarchy")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeViewMode === "hierarchy"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Hierarchy View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
