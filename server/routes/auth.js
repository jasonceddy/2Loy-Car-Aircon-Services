import { Router } from "express"
import { validate } from "../middlewares/ValidationMiddleware.js"
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchema.js"
import {
  forgotPassword,
  getToken,
  getUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "../controllers/AuthController.js"
import { authenticateUser } from "../middlewares/AuthMiddleware.js"

const router = Router()

router.post("/register", validate(registerSchema), signUp)
router.post("/login", validate(loginSchema), signIn)
router.get("/logout", signOut)
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword)
router.post("/reset-password", validate(resetPasswordSchema), resetPassword)
router.get("/current-user", authenticateUser, getUser)
router.get("/get-token", getToken)

export default router
