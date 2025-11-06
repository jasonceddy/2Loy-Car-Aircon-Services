import z from "zod"

export const registerSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.email().min(1, "Please enter your email"),
  password: z.string().min(5, "Password must be at least 5 characters long"),
  phone: z
    .string()
    .min(11, "Invalid phone number")
    .max(11, "Invalid phone number"),
})

export const loginSchema = z.object({
  email: z.email().min(1, "Please enter your email"),
  password: z.string().min(1, "Please enter your password"),
})

export const forgotPasswordSchema = z.object({
  email: z.email().min(1, "Please enter your email"),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(5, "Password must be at least 5 characters long"),
  token: z.string(),
})
