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

export default router
