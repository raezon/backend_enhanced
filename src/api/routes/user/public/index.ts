import { UserController } from "@/core/interfaces/controllers/user.ctrl";
import express from "express";
const router = express.Router();
const { signIn, refresh } = UserController;

router.post("/sign-in", signIn);
router.get("/refresh", refresh);

export default router;
