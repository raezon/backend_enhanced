import { Router } from "express";
import { checkAuth } from "../middlewares/check-auth";
import publicRoutes from "./public";
import privateRoutes from "./private";

const router = Router();

router.use("/public", publicRoutes);
router.use("/private", checkAuth, privateRoutes);

export default router;
