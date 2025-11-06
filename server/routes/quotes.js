import { Router } from "express"
import { authenticateUser } from "../middlewares/AuthMiddleware.js"
import {
  acceptQuote,
  createQuote,
  updateQuote,
  sendQuote,
  deleteQuote,
} from "../controllers/QuoteController.js"

const router = Router()

router.use(authenticateUser)

router.post("/:id/generate", createQuote)
router.patch("/:id/accept", acceptQuote)
router.patch("/:id", updateQuote)
router.post("/:id/send", sendQuote)
router.delete("/:id/cancel", deleteQuote)

export default router