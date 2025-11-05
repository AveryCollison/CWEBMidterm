import { Router } from "express";
import { authController, loginValidators } from "../controllers/authController.js";

const router = Router();

router.get("/login", authController.loginPage);
router.post("/login", loginValidators, authController.login);
router.get("/logout", authController.logout);

export default router;
