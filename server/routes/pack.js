import { Router } from "express";
import { authenticateUser, authorizePermissions } from "../middlewares/AuthMiddleware.js";
import {
  createPack,
  deletePack,
  getAllPacks,
  getPackById,
  updatePack,
  togglePackVisibility,
} from "../controllers/PackController.js"; // Make sure this path is correct

import { validate } from "../middlewares/ValidationMiddleware.js";
import {
  createPackSchema,
  updatePackSchema,
} from "../schemas/packSchema.js"; // Make sure this path is correct

const router = Router();

// Protect all routes below this line with authentication
router.use(authenticateUser); // User must be logged in to access these routes

// Public route (get all packs)
router.get("/", authorizePermissions("ADMIN", "CUSTOMER"), getAllPacks);

// Route to create a new pack (only for admins)
router.post(
  "/",
  authorizePermissions("ADMIN"),
  validate(createPackSchema), // Validate request body using schema
  createPack
);

// Route to update an existing pack (only for admins)
router.patch(
  "/:id",
  authorizePermissions("ADMIN"),
  validate(updatePackSchema), // Validate request body using schema
  updatePack
);

// Route to get a single pack by its ID (allow both admin and customer)
router.get("/:id", authorizePermissions("ADMIN", "CUSTOMER"), getPackById);

// Route to delete a pack (only for admins)
router.delete("/:id", authorizePermissions("ADMIN"), deletePack);

// Route to toggle pack visibility (hide/unhide) (only for admins)
router.patch("/:id/hide", authorizePermissions("ADMIN"), togglePackVisibility);
router.patch("/:id/unhide", authorizePermissions("ADMIN"), togglePackVisibility);

export default router;
