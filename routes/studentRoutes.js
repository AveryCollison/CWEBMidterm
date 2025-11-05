import { Router } from "express";
import { studentController } from "../controllers/studentController.js";
import { requireAuth } from "../middleware/auth.js";

const ROLES = {
  STUDENT: "student",
  TUTOR: "tutor",
  ADMIN: "admin",
};

import { requireRole } from "../middleware/roleGuard.js";

const router = Router();

router.get(
  "/sessions",
  requireAuth,
  requireRole(ROLES.STUDENT),
  studentController.mySessions
);

router.get(
  "/availability",
  requireAuth,
  requireRole(ROLES.STUDENT),
  studentController.availability
);

router.post(
  "/book/:slotId",
  requireAuth,
  requireRole(ROLES.STUDENT),
  studentController.bookSlot
);

export default router;
