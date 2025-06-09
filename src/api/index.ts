import packageRoutes from "./routes/package";
import passengerRoutes from "./routes/passenger";
import permissionRoutes from "./routes/permission";
import roleRoutes from "./routes/role";
import visaBookingRoutes from "./routes/visa-booking";
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

router.use("/visa-booking", visaBookingRoutes);

router.use("/role", roleRoutes);

router.use("/permission", permissionRoutes);

router.use("/passenger", passengerRoutes);

router.use("/package", packageRoutes);
