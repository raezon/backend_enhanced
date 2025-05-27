import { Router } from "express";
import {
    clientRoutes,
    userRoutes,
    hotelRoutes,
    permissionRoutes,
    roleRoutes,
    serviceFeesRoutes,
    visaRoutes,
    agencyRoutes,
    bookingVisaRoutes,
    countryRoutes
} from "./routes";
const router = Router();

router.use("/client", clientRoutes);
router.use("/users", userRoutes);
router.use("/hotels", hotelRoutes);
router.use("/permission", permissionRoutes);
router.use("/role", roleRoutes);
router.use("/visa", visaRoutes);
router.use("/service-fees", serviceFeesRoutes);
router.use("/agency", agencyRoutes);
router.use("/visa-bookings", bookingVisaRoutes);
router.use("/country", countryRoutes);

export default router;
