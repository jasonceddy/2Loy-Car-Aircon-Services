import z from "zod"

export const carSchema = z.object({
  plateNo: z
    .string()
    .min(1, "Please enter a plate number")
    .regex(
      /^[A-Za-z]{3}-[0-9]{4}$/,
      "Plate number must be in format: 3 letters - 4 numbers (e.g., ABC-1234)"
    )
    .transform((val) => val.toUpperCase()),
  brand: z.string().min(1, "Please enter a brand name"),
  model: z.string().min(1, "Please enter a model name"),
  year: z.string().min(4, "Please enter a valid year"),
  notes: z.string().min(1, "Please enter some notes"),
})
