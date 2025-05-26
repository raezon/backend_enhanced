import { AuthController } from "@/business-logic/controllers";
import { Router } from "express";
const router = Router();

const { signIn, refresh } = AuthController;

router.post("/sign-in", signIn);
router.get("/refresh", refresh);

export default router;
