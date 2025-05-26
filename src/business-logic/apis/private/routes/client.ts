import { AuthController } from "@/business-logic/controllers";
import { Router } from "express";
const router = Router();
const { signOut } = AuthController;

router.get("/sign-out", signOut);

export default router;
