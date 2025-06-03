import agencyRoutes from "./routes/agency";
import userRoutes from "./routes/user";
import { Router } from "express";
const router = Router();
export default router;

router.use("/user", userRoutes);
router.use("/agency", agencyRoutes);
