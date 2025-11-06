import { Router } from "express"
import { authenticateUser } from "../middlewares/AuthMiddleware.js"
import {
  addJobNote,
  completeJob,
  getJobs,
  updateJobStage,
} from "../controllers/JobController.js"

const router = Router()

router.use(authenticateUser)

router.get("/", getJobs)
router.patch("/:id/stage", updateJobStage)
router.post("/:id/notes", addJobNote)
router.post("/:id/complete", completeJob)

export default router