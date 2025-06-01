import { Router } from "express";
import { visaBookingController } from "@business/controllers/visa-booking.ctrl";
import upload from "@/config/multer";
const router = Router();
const {
    updateVisaBooking,
    getAllVisaBookings,
    deleteVisaBooking,
    getVisaBookingById,
    requestVisa,
} = visaBookingController;

router.post("/", upload.array("documents"), requestVisa);
router.put("/:id", updateVisaBooking);
router.get("/", getAllVisaBookings);
router.get("/:id", getVisaBookingById);
router.delete("/:id", deleteVisaBooking);

export default router;
