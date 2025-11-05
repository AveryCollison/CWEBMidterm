import { Router } from "express";
import { tutorController } from "../controllers/tutorController.js";
import { requireAuth } from "../middleware/auth.js";

import { requireRole } from "../middleware/roleGuard.js";

const ROLES = {
  STUDENT: "student",
  TUTOR: "tutor",
  ADMIN: "admin",
};

const router = Router();

router.get(
  "/slots",
  requireAuth,
  requireRole(ROLES.TUTOR),
  tutorController.slotsPage
);

router.post(
  "/slots",
  requireAuth,
  requireRole(ROLES.TUTOR),
  tutorController.createSlot
);

router.post(
  "/slots/delete/:id",
  requireAuth,
  requireRole(ROLES.TUTOR),
  tutorController.deleteSlot
);

export default router;
