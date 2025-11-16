import z from "zod"

const allowedUoms = ["pc", "set", "bottle", "can", "meter", "roll"]

export const createPartSchema = z.object({
  name: z.string().min(1, "Please enter part name"),

  price: z
    .string()
    .min(1, "Please enter part price")
    .refine((val) => !isNaN(val) && parseFloat(val) >= 0, "Price must be >= 0")
    .transform((val) => parseFloat(val)),

  stock: z
    .string()
    .min(1, "Please enter stock")
    .refine((val) => !isNaN(val) && parseFloat(val) > 0, "Stock must be > 0")
    .transform((val) => parseFloat(val)),

  threshold: z
    .string()
    .min(1, "Please enter threshold")
    .refine((val) => !isNaN(val) && parseFloat(val) > 0, "Threshold must be > 0")
    .transform((val) => parseFloat(val)),

  uom: z
    .string()
    .refine((val) => allowedUoms.includes(val), "Invalid UoM"),

  serialNumber: z.string().optional().nullable(),
})

export const updatePartSchema = z.object({
  name: z.string().min(1, "Please enter part name"),

  price: z
    .string()
    .min(1, "Please enter part price")
    .refine((val) => !isNaN(val) && parseFloat(val) >= 0, "Price must be >= 0")
    .transform((val) => parseFloat(val)),

  threshold: z
    .string()
    .min(1, "Please enter threshold")
    .refine((val) => !isNaN(val) && parseFloat(val) > 0, "Threshold must be > 0")
    .transform((val) => parseFloat(val)),

  uom: z
    .string()
    .refine((val) => allowedUoms.includes(val), "Invalid UoM"),

  serialNumber: z.string().optional().nullable(),
})

export const stockOutandInSchema = z.object({
  quantity: z
    .string()
    .min(1, "Please enter quantity")
    .refine((val) => !isNaN(val) && parseFloat(val) > 0, "Quantity must be > 0")
    .transform((val) => parseFloat(val)),
})

