import { Router } from "express"
import { authenticateUser } from "../middlewares/AuthMiddleware.js"
import {
  createPart,
  getAllParts,
  getParts,
  stockIn,
  stockOut,
  updatePart,
} from "../controllers/PartController.js"
import { validate } from "../middlewares/ValidationMiddleware.js"
import {
  createPartSchema,
  stockOutandInSchema,
  updatePartSchema,
} from "../schemas/partSchema.js"

const router = Router()

router.use(authenticateUser)

router.get("/", getParts)
router.post("/", validate(createPartSchema), createPart)
router.patch("/:id", validate(updatePartSchema), updatePart)
router.patch("/:id/stock-in", validate(stockOutandInSchema), stockIn)
router.patch("/:id/stock-out", validate(stockOutandInSchema), stockOut)
router.get("/all", getAllParts)

export default router