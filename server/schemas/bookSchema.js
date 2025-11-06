import z from "zod"

export const createBookSchema = z.object({
  carId: z.number().int().positive(),
  serviceIds: z.array(z.number().int().positive()).optional(),
  packIds: z.array(z.number().int().positive()).optional(),
  scheduledAt: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  servicePreferences: z
    .object({ bookingMode: z.enum(["consult", "book"]).optional() })
    .optional(),
  technicianId: z.number().int().positive().optional(),
})

export const rejectSchema = z.object({ reason: z.string().min(1, "Required") })