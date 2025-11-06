import { Router } from "express"
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/AuthMiddleware.js"
import { getInventoryLogs } from "../controllers/PartController.js"

const router = Router()

router.use(authenticateUser)
router.use(authorizePermissions("ADMIN"))

router.get("/", getInventoryLogs)

export default router