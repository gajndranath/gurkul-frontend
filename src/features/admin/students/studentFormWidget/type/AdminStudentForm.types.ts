import { z } from "zod";

export const studentFormSchema = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  fatherName: z.string().optional(),
  slotId: z.string().min(1, "Please select a slot"),
  seatNumber: z.string().optional(),
  monthlyFee: z.number().min(0),
  joiningDate: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
