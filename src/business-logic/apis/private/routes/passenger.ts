import { PassengerController } from "@/business-logic/controllers/passenger.ctrl";
import { fileUploadMiddleware } from "@/config/multer";
import { Router } from "express";
const router = Router();

const { createPassenger, deletePassenger, updatePassenger } = PassengerController;

router.post("/", fileUploadMiddleware, createPassenger);
router.patch("/:id", updatePassenger);
router.delete("/:id", deletePassenger);

export default router;
