import z from "zod";

export const creditHistoryEntrySchema = z.object({
  id: z.string(),
  change: z.number().int(),
  reason: z.string(),
  createdAt: z.string(),
});

export const creditSummarySchema = z.object({
  credits: z.number().int().nonnegative(),
  histories: z.array(creditHistoryEntrySchema),
});

export type creditHistoryEntry = z.infer<typeof creditHistoryEntrySchema>;
export type creditSummary = z.infer<typeof creditSummarySchema>;
