import { z } from "zod";

export const ApprovalItemTypeSchema = z.enum(["Folder", "Video", "PDF", "Image"]);
export type ApprovalItemType = z.infer<typeof ApprovalItemTypeSchema>;

export const ApprovalItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: ApprovalItemTypeSchema,
  submittedBy: z.string().min(1),
  date: z.string(),
  status: z.string(),
  description: z.string().optional(),
  urgent: z.boolean().default(false),
  category: z.string().optional(),
});
export type ApprovalItem = z.infer<typeof ApprovalItemSchema>;

export const ApprovalQueueResponseSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  items: z.array(ApprovalItemSchema),
});
export type ApprovalQueueResponse = z.infer<typeof ApprovalQueueResponseSchema>;
