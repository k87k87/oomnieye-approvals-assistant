import { z } from "zod";

export const UrgencyLevelSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type UrgencyLevel = z.infer<typeof UrgencyLevelSchema>;

export const PrioritizedItemSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  urgency: UrgencyLevelSchema,
  reason: z.string(),
  recommendedAction: z.string(),
});
export type PrioritizedItem = z.infer<typeof PrioritizedItemSchema>;

export const StructuredSummarySchema = z.object({
  overview: z.string().min(1),
  totalPending: z.number().int().nonnegative(),
  highPriorityCount: z.number().int().nonnegative(),
  prioritizedItems: z.array(PrioritizedItemSchema),
  topRecommendation: z.string().min(1),
  degraded: z.boolean().default(false),
  fallbackReason: z.string().optional(),
  generatedAt: z.string().optional(),
});
export type StructuredSummary = z.infer<typeof StructuredSummarySchema>;

export const SummaryResponseSchema = z.object({
  success: z.boolean(),
  data: StructuredSummarySchema,
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});
export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;
