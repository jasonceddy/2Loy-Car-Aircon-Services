import { Router } from "express"
import { authenticateUser } from "../middlewares/AuthMiddleware.js"
import {
  getTechnicians,
  getUsers,
  getAllTechnicians,
  getCustomers,
  editUser,
  blockUser,
  unblockUser,
  deleteUser,
  createUser,
  updateMe,
  editOwnDetails,
  verifyPassword,
  changePassword,
} from "../controllers/UserController.js"
import { validate } from "../middlewares/ValidationMiddleware.js"
import { editUserSchema, passwordSchema } from "../schemas/userSchema.js"

const router = Router()

router.use(authenticateUser)

router.get("/technicians", getTechnicians)
router.get("/users", getUsers)
router.patch("/edit", validate(editUserSchema), editOwnDetails)
router.get("/all-technicians", getAllTechnicians)
router.get("/customers", getCustomers)

// existing
router.post("/", createUser)
router.patch("/me", validate(editUserSchema), updateMe)

// new
router.post("/verify-password", verifyPassword)
router.patch("/new-password", validate(passwordSchema), changePassword)

// shared
router.patch("/:id", validate(editUserSchema), editUser)
router.patch("/:id/block", blockUser)
router.patch("/:id/unblock", unblockUser)
router.delete("/:id", deleteUser)

export default router
