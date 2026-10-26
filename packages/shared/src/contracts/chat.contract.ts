import { z } from "zod";

export const ActionTypeSchema = z.enum(["summary", "talk", "help", "teach", "greeting"]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export const ChatMessageRoleSchema = z.enum(["system", "user", "assistant"]);
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>;

export const ChatMessageSchema = z.object({
  id: z.string().optional(),
  role: ChatMessageRoleSchema,
  content: z.string(),
  citations: z.array(z.string()).optional(),
  timestamp: z.string().optional(),
  degraded: z.boolean().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  action: ActionTypeSchema,
  message: z.string().optional().default(""),
  history: z.array(ChatMessageSchema).optional().default([]),
  language: z.string().optional().default("en"),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const GreetingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    greeting: z.string(),
    pendingCount: z.number(),
    degraded: z.boolean().default(false),
  }),
});
export type GreetingResponse = z.infer<typeof GreetingResponseSchema>;
