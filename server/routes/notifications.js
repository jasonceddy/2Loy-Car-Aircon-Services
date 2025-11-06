import { Router } from "express"
import { authenticateUser, authorizePermissions } from "../middlewares/AuthMiddleware.js"
import { listNotifications, markAsRead, createNotification } from "../controllers/NotificationController.js"

const router = Router()

router.use(authenticateUser)

router.get("/", listNotifications)
router.patch("/:id/read", markAsRead)

// Admin can create arbitrary notifications
router.post("/", authorizePermissions("ADMIN"), createNotification)

export default router
