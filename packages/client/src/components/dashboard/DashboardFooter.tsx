import React from "react";
import { CheckCircle2, Shield } from "lucide-react";

export const DashboardFooter: React.FC = () => {
  return (
    <footer className="h-9 bg-white border-t border-slate-200 px-5 flex items-center justify-between text-[11px] text-slate-500 select-none shadow-xs">
      {/* Left: Operational Health Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Ready</span>
        </div>
        <span className="text-slate-300">|</span>
        <span>Help Admin View — Approvals and rejections access active</span>
      </div>

      {/* Center: Copyright */}
      <div className="hidden md:block text-slate-400">© 2026 OomniEye. All rights reserved.</div>

      {/* Right: Metrics & ALLCAD Logo */}
      <div className="flex items-center space-x-3 font-medium">
        <span>26 folders / items</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">HMS Panel</span>
        <span className="text-slate-300">|</span>
        <div className="flex items-center space-x-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          <Shield className="w-3 h-3 text-cyan-600" />
          <span className="text-[10px] tracking-wider">ALLCAD</span>
        </div>
      </div>
    </footer>
  );
};
