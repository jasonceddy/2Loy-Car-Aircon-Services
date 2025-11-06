
import z from "zod"

export const editUserSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.email().min(1, "Please enter your email"),
  phone: z
    .string()
    .min(11, "Invalid phone number")
    .max(11, "Invalid phone number"),
})

export const passwordSchema = z.object({
  new_password: z
    .string()
    .min(5, "Password must be at least 5 characters long"),
})
