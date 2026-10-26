import React from "react";
import {
  Folder,
  Video,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import { ApprovalItem } from "@oomnieye/shared";

interface ApprovalsTableProps {
  items: ApprovalItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
}

export const ApprovalsTable: React.FC<ApprovalsTableProps> = ({
  items,
  selectedItemId,
  onSelectItem,
}) => {
  const getItemIcon = (type: string) => {
    switch (type) {
      case "Folder":
        return <Folder className="w-4 h-4 text-purple-600 fill-purple-100" />;
      case "Video":
        return <Video className="w-4 h-4 text-rose-600 fill-rose-100" />;
      case "PDF":
        return <FileText className="w-4 h-4 text-blue-600 fill-blue-100" />;
      case "Image":
        return <ImageIcon className="w-4 h-4 text-emerald-600 fill-emerald-100" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Folder / Content Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Submitted by</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectItem(item.id)}
                  className={`group cursor-pointer transition-colors ${
                    isSelected ? "bg-purple-50/50 hover:bg-purple-50/70" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Name with Icon and Subtitle */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60">
                        {getItemIcon(item.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center space-x-1.5">
                          <span>{item.name}</span>
                          {item.urgent && (
                            <span
                              title="High Priority Review"
                              className="inline-flex items-center text-amber-600"
                            >
                              <AlertCircle className="w-3.5 h-3.5 fill-amber-100" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {item.description ? item.description.substring(0, 48) + "..." : item.type}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4 font-medium text-slate-600">{item.type}</td>

                  {/* Submitted By */}
                  <td className="py-3.5 px-4 font-medium text-slate-700">{item.submittedBy}</td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-slate-500">{item.date}</td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending Review
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
