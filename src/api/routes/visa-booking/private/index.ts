import { fileUploadMiddleware } from "@/config/multer";
import { VisaBookingController } from "@/core/interfaces/controllers/visa-booking.ctrl";
import { idValidator } from "@/middlewares/id-validator";
import express from "express";
const router = express.Router();
const {
    createVisaBooking,
    deleteVisaBooking,
    getAllVisaBookings,
    getVisaBookingById,
    updateVisaBooking,
} = VisaBookingController;

router.post("", createVisaBooking);
router.get("", getAllVisaBookings);
router.get(
    "/:id",
    idValidator("id", "Visa Request pivot (basicInfo with passengers)  ID"),
    getVisaBookingById
);
router.delete(
    "/:id",
    idValidator("id", "Visa Request pivot (basicInfo with passengers)  ID"),
    deleteVisaBooking
);
router.put("/:id", idValidator("id", "Visa Request pivot (basicInfo with passengers) ID"), fileUploadMiddleware, updateVisaBooking);

export default router;
