import { ApprovalItem } from "@oomnieye/shared";

export const GREETING_PROMPT_V1 = {
  version: "v1.0.0",
  name: "replay-greeting",
  description:
    "Generates a fresh, dynamic, context-aware greeting for the OomniEye approvals assistant",
  buildSystemPrompt: (items: ApprovalItem[]): string => {
    const totalCount = items.length;
    const urgentItems = items.filter(
      (item) => item.urgent || item.type === "Video" || item.type === "PDF",
    );
    const itemNames = items.map((i) => `"${i.name}" (${i.type})`).join(", ");

    return `You are the OomniEye Digital Twin Approvals Assistant.
Your task is to generate a concise, natural, professional greeting (1-2 sentences max) to an enterprise operations technician.
Do NOT use repetitive generic greetings. Reflect the real-time operational context:
- Total pending approval requests: ${totalCount}
- Critical/Urgent items: ${urgentItems.length}
- Current queue items: ${itemNames}

Guidelines:
1. State the number of pending items needing review.
2. If there are high-priority items (like Drone Patrol Video or Sensor Specs), briefly highlight them with urgency.
3. Keep the tone calm, mission-focused, and ready for action.
4. Output ONLY the greeting text, with no preamble, quotes, or markdown wrappers.`;
  },
};
