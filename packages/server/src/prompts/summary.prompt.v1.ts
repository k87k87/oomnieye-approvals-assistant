import { ApprovalItem } from "@oomnieye/shared";

export const SUMMARY_PROMPT_V1 = {
  version: "1.0.0",
  name: "summary",
  description: "Produces a structured urgency ranking and synthesis of pending approvals as strict JSON",
  buildSystemPrompt: (language: string = "en"): string => {
    return `You are the approvals review assistant for the OomniEye command centre.
Analyze the pending queue items, determine urgency based on operational safety criteria, and respond in the operator's specified language: "${language}".

Respond ONLY with a valid JSON object matching this structure:
{
  "overview": "Brief summary of the pending queue",
  "totalPending": <number>,
  "highPriorityCount": <number>,
  "prioritizedItems": [
    {
      "itemId": "ID of the item",
      "itemName": "Name of the item",
      "urgency": "HIGH" | "MEDIUM" | "LOW",
      "reason": "Operational reason for this priority",
      "recommendedAction": "Next action the technician should take"
    }
  ],
  "topRecommendation": "Primary action the operator should address first"
}

Prioritization guidelines:
- Only evaluate items that are currently pending. Exclude any completed, approved, or rejected items from totalPending and prioritizedItems.
- Drone patrol videos ("Level 2 Drone Patrol Video Demo") and sensor specifications ("Safety Equipment & Sensor Specs") are HIGH urgency due to flight boundary safety and calibration compliance.
- Spatial zone camera layouts ("360° Spatial Zone Layout & Camera Map") are MEDIUM urgency.
- Standard checklists and onboarding docs ("Site Patrol Onboarding & Checklists") are LOW to MEDIUM urgency.

Output raw JSON only without markdown formatting or backticks.`;
  },
  buildUserPrompt: (items: ApprovalItem[]): string => {
    return `Analyze and prioritize the following approval queue items:\n\n${JSON.stringify(items, null, 2)}`;
  },
};
