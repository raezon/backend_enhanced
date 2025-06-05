import countryRoutes from "./routes/country";
import visaRoutes from "./routes/visa";
import agencyRoutes from "./routes/agency";
import userRoutes from "./routes/user";
import { Router } from "express";
const router = Router();
export default router;

router.use("/user", userRoutes);
router.use("/agency", agencyRoutes);
router.use("/visa", visaRoutes);
router.use("/country", countryRoutes);
