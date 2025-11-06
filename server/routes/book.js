import { Router } from "express"
import {
  assignTechnician,
  confirmBooking,
  createBook,
  getBookings,
  rejectBooking,
  createChangeRequest,
  approveChangeRequest,
} from "../controllers/BookController.js"
import { authenticateUser, authorizePermissions } from "../middlewares/AuthMiddleware.js"
import { validate } from "../middlewares/ValidationMiddleware.js"
import { createBookSchema, rejectSchema } from "../schemas/bookSchema.js"

const router = Router()

router.use(authenticateUser)

router.post(
  "/",
  authorizePermissions("CUSTOMER"),
  validate(createBookSchema),
  createBook
)

router.get("/", getBookings)
router.patch("/:id/assign", authorizePermissions("ADMIN"), assignTechnician)
router.patch(
  "/:id/reject",
  authorizePermissions("ADMIN"),
  validate(rejectSchema),
  rejectBooking
)
// Update booking fields (notes/preferences)
router.patch("/:id", authorizePermissions("CUSTOMER", "ADMIN"), async (req, res, next) => {
  try {
    const data = await import("../controllers/BookController.js").then(m => m.updateBooking(req, res))
  } catch (err) {
    next(err)
  }
})
router.patch("/:id/confirm", authorizePermissions("ADMIN"), confirmBooking)
// Customer or admin can cancel a booking
router.patch(
  "/:id/cancel",
  authorizePermissions("CUSTOMER", "ADMIN"),
  async (req, res, next) => {
    try {
      const data = await import("../controllers/BookController.js").then((m) => m.cancelBooking(req, res))
    } catch (err) {
      next(err)
    }
  }
)

  // Customer creates a change request for a booking
  router.post(
    "/:id/change-request",
    authorizePermissions("CUSTOMER"),
    createChangeRequest
  )

  // Admin approves a change request
  router.patch(
    "/:id/change-request/approve",
    authorizePermissions("ADMIN"),
    approveChangeRequest
  )

  // Admin lists change requests
  router.get(
    "/change-requests",
    authorizePermissions("ADMIN"),
    // will be handled by listChangeRequests
    async (req, res, next) => {
      try {
        const data = await import("../controllers/BookController.js").then(m => m.listChangeRequests(req, res))
      } catch (err) {
        next(err)
      }
    }
  )

  // Admin reject a change request
  router.patch(
    "/change-requests/:id/reject",
    authorizePermissions("ADMIN"),
    async (req, res, next) => {
      try {
        const data = await import("../controllers/BookController.js").then(m => m.rejectChangeRequest(req, res))
      } catch (err) {
        next(err)
      }
    }
  )

export default router