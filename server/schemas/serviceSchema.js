import z from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(1, "Please enter service name"),
  cost: z
    .string()
    .min(1, "Please enter service cost")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Please enter a valid cost greater than 0"
    )
    .transform((val) => parseFloat(val)),
  description: z.string().min(1, "Please enter service description"),
  allowCustomerTechChoice: z.boolean().default(true),
})

export const updateServiceSchema = z.object({
  name: z.string().min(1, "Please enter service name"),
  cost: z
    .string()
    .min(1, "Please enter service cost")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Please enter a valid cost greater than 0"
    )
    .transform((val) => parseFloat(val)),
  description: z.string().min(1, "Please enter service description"),
  allowCustomerTechChoice: z.boolean().default(true),
})
