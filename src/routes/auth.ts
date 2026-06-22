import { Router } from "express";
import * as authControllers from "../controllers/authController.js";

const router = Router();

router.post("/register", authControllers.registerUserController);

router.post("/login", authControllers.loginController);

router.post("/google", authControllers.googleLoginController);

router.post("/logout", authControllers.logoutController);

router.post("/refresh", authControllers.refreshController);

router.post("/reset/request", authControllers.requestResetEmailController);

router.post("/reset/confirm", authControllers.resetPasswordController);

export default router;
