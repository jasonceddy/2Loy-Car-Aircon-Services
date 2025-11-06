import { Router } from "express"
import { authenticateUser } from "../middlewares/AuthMiddleware.js"
import { addPayment, paidBilling } from "../controllers/BillingController.js"

const router = Router()

router.use(authenticateUser)

router.post("/:id/payment", addPayment)
router.patch("/:id", paidBilling)

export default router