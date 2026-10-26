"use client";

import React, { useEffect, useState, useMemo } from "react";
import { TopNavbar } from "../components/dashboard/TopNavbar";
import { ApprovalsHeader } from "../components/dashboard/ApprovalsHeader";
import { ApprovalsTable } from "../components/dashboard/ApprovalsTable";
import { ItemPreviewPanel } from "../components/dashboard/ItemPreviewPanel";
import { DashboardFooter } from "../components/dashboard/DashboardFooter";
import { AssistantWidget } from "../components/assistant/AssistantWidget";
import { ApiClient } from "../services/api.client";
import { ApprovalItem } from "@oomnieye/shared";
import { Loader2, AlertCircle } from "lucide-react";

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"queue" | "hierarchy">("queue");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load approvals queue data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await ApiClient.getApprovals();
        if (isMounted) {
          setItems(res.items);
          if (res.items.length > 0) {
            setSelectedItemId(res.items[0]?.id ?? null);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch approvals queue:", err);
          setLoadError(
            "Unable to connect to OomniEye Command Centre API. Please ensure server is running on port 5000.",
          );
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter items based on user search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.submittedBy.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)),
    );
  }, [items, searchQuery]);

  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6fa] text-slate-800 font-sans">
      {/* Top Application Navbar */}
      <TopNavbar />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5 flex flex-col">
        {/* Approvals Header with Actions & Search */}
        <ApprovalsHeader
          totalItems={items.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeViewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-slate-500 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Connecting to Digital Twin Approvals Service...</p>
          </div>
        )}

        {loadError && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Offline / Fallback Notice: </span>
              {loadError}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content Split: Approvals Table (Left) + Selected Item Telemetry Preview (Right) */}
        {!isLoading && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
            {/* Approvals Table */}
            <div className="lg:col-span-7 xl:col-span-8">
              <ApprovalsTable
                items={filteredItems}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
              />
            </div>

            {/* Split Preview Panel */}
            <div className="lg:col-span-5 xl:col-span-4">
              <ItemPreviewPanel item={selectedItem} />
            </div>
          </div>
        )}
      </main>

      {/* System Footer Bar */}
      <DashboardFooter />

      {/* Target UI: AI Approvals Assistant Panel (Floating in Lower Right) */}
      <AssistantWidget />
    </div>
  );
}
