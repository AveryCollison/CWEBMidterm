import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

const ROLES = {
  STUDENT: "student",
  TUTOR: "tutor",
  ADMIN: "admin",
};

const router = Router();

router.get(
  "/overview",
  requireAuth,
  requireRole(ROLES.ADMIN),
  adminController.overview
);

router.get(
  "/create-user",
  requireAuth,
  requireRole(ROLES.ADMIN),
  adminController.createUserPage
);

router.post(
  "/create-user",
  requireAuth,
  requireRole(ROLES.ADMIN),
  adminController.createUser
);

router.post(
  "/users/delete/:id",
  requireAuth,
  requireRole(ROLES.TUTOR), // ❗️auth kept untouched
  adminController.deleteUser
);

router.get(
  "/create-subject",
  requireAuth,
  requireRole(ROLES.ADMIN),
  adminController.createSubjectPage
);

router.post(
  "/create-subject",
  requireAuth,
  requireRole(ROLES.ADMIN),
  adminController.createSubject
);

router.post(
  "/subject/delete/:id", // ❗️path kept untouched
  requireAuth,
  requireRole(ROLES.TUTOR), // ❗️original role guard preserved
  adminController.deleteSubject
);

export default router;
