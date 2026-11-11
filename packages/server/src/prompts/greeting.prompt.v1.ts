import { ApprovalItem } from "@oomnieye/shared";

export const GREETING_PROMPT_V1 = {
  version: "1.0.0",
  name: "greeting",
  description: "Generates a dynamic greeting based on pending approvals queue status",
  buildSystemPrompt: (items: ApprovalItem[]): string => {
    const totalCount = items.length;
    const urgentItems = items.filter(
      (item) => item.urgent || item.type === "Video" || item.type === "PDF",
    );
    const itemNames = items.map((i) => `"${i.name}" (${i.type})`).join(", ");

    return `You are the approvals assistant for the OomniEye command centre.
Generate a concise, professional greeting (1-2 sentences) for an operations technician starting their shift.
Reflect current queue status:
- Total pending approval requests: ${totalCount}
- Critical/Urgent items: ${urgentItems.length}
- Current queue items: ${itemNames}

Keep it focused, calm, and actionable. If urgent items exist (such as Level 2 Drone Patrol Video Demo or Sensor Specs), highlight them briefly. Return only the greeting text without markdown code blocks.`;
  },
};
