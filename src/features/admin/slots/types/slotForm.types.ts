// frontend/src/features/admin/slots/types/slotForm.types.ts
import { z } from "zod";

export const slotSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  roomId: z.string().min(1, "Room is required"),
  slotType: z.enum(["FULL_DAY", "PARTIAL"]).default("PARTIAL"),
  timeRange: z.object({
    start: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid format"),
    end: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid format"),
  }),
  monthlyFee: z.coerce.number().min(0, "Fee cannot be negative"),
  totalSeats: z.coerce.number().int().min(1, "Minimum 1 seat required"),
});


export type SlotFormValues = z.infer<typeof slotSchema>;
