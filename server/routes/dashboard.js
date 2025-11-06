import { Router } from "express"
import { authenticateUser } from "../middlewares/AuthMiddleware.js"
import {
  getBookingsOverview,
  getJobsOverview,
  getLowStock,
  getRevenueSummary,
  getTrends,
  getRevenueDebug,
} from "../controllers/DashboardController.js"

const router = Router()

router.use(authenticateUser)

router.get("/bookings-overview", getBookingsOverview)
router.get("/jobs-overview", getJobsOverview)
router.get("/revenue-summary", getRevenueSummary)
router.get("/trends", getTrends)
router.get("/debug", getRevenueDebug)
router.get("/low-stock", getLowStock)

export default router