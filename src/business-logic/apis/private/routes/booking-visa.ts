import { Router } from "express";
import { visaBookingController } from "@business/controllers/visa-booking.ctrl";
const router = Router();
const {updateVisaBooking , getAllVisaBookings , deleteVisaBooking ,getVisaBookingById ,requestVisa} = visaBookingController

router.post("/", requestVisa);
router.put("/:id", updateVisaBooking);
router.get("/", getAllVisaBookings);
router.get("/:id", getVisaBookingById);
router.delete("/:id", deleteVisaBooking);

export default router;
