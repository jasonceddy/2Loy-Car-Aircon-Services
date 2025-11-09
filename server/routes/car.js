import { Router } from "express"
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/AuthMiddleware.js"
import {
  createCar,
  deleteCar,
  getAllCars,
  getMyCars,
  updateCar,
  transferCarOwnership,
} from "../controllers/CarController.js"
import { validate } from "../middlewares/ValidationMiddleware.js"
import { carSchema } from "../schemas/carSchema.js"

const router = Router()

router.use(authenticateUser)

router.get("/", authorizePermissions("ADMIN"), getAllCars)
router.get("/my-cars", authorizePermissions("CUSTOMER"), getMyCars)
router.post("/", validate(carSchema), createCar)
router.patch("/:id", validate(carSchema), updateCar)
router.delete("/:id", deleteCar)
router.post("/:id/transfer", authorizePermissions("ADMIN"), transferCarOwnership)
// allow admins and customers to request history; controller will enforce owner-only access for customers
router.get("/:id/history", authorizePermissions("ADMIN", "CUSTOMER"), async (req, res, next) => {
  try {
    const data = await import("../controllers/CarController.js").then(m => m.getCarHistory(req, res))
  } catch (err) {
    next(err)
  }
})
router.get("/:id/transfers", authorizePermissions("ADMIN"), async (req, res, next) => {
  try {
    const data = await import("../controllers/CarController.js").then(m => m.getCarTransfers(req, res))
  } catch (err) {
    next(err)
  }
})

export default router
