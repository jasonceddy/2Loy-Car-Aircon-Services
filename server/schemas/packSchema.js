import { z } from "zod";

// Schema for creating a pack
export const createPackSchema = z.object({
  name: z.string().min(1, "Please enter pack name"),
  price: z
    .number()
    .positive("Please enter a valid price greater than 0"),
  description: z.string().min(1, "Please enter pack description"),
  serviceIds: z
    .array(z.number().int())
    .min(1, "Please select at least one service for the pack"),
  hidden: z.boolean().optional().default(false),
  allowCustomerTechChoice: z.boolean().optional(),
});

// Schema for updating a pack
export const updatePackSchema = z.object({
  name: z.string().min(1, "Please enter pack name").optional(),
  price: z
    .number()
    .positive("Please enter a valid price greater than 0")
    .optional(),
  description: z.string().min(1, "Please enter pack description").optional(),
  serviceIds: z
    .array(z.number().int())
    .min(1, "Please select at least one service for the pack")
    .optional(),
  hidden: z.boolean().optional(),
  allowCustomerTechChoice: z.boolean().optional(),
});
