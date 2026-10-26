import React from "react";
import { Search, RotateCw, Maximize2, MessageSquare, Bell, ChevronRight } from "lucide-react";

export const TopNavbar: React.FC = () => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between text-slate-700 select-none shadow-sm sticky top-0 z-20">
      {/* Left: Brand & Product */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20">
            OE
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">OomniEye</span>
              <span className="text-[10px] uppercase font-semibold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                Digital Twin Solutions
              </span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-medium text-slate-500">Command Centre</span>
      </div>

      {/* Right: Operational Controls & User Badge */}
      <div className="flex items-center space-x-2 text-slate-600">
        <button
          title="Search"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          title="Refresh Feed"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          title="Toggle Fullscreen"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          title="Operator Logs"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Notifications with Unread Dot */}
        <div className="relative">
          <button
            title="Notifications"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1"></div>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
            R
          </div>
        </div>
      </div>
    </header>
  );
};
