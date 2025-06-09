import { fileUploadMiddleware } from "@/config/multer";
import { PassengerController } from "@/core/interfaces/controllers/passenger.ctrl";
import { idValidator } from "@/middlewares/id-validator";
import express from "express";
const router = express.Router();

const { createPassenger, deletePassenger, updatePassenger } = PassengerController;

router.post("/", fileUploadMiddleware, createPassenger);
router.delete("/:id", idValidator("id", "Passenger ID"), deletePassenger);
router.put("/:id", idValidator("id", "Passenger ID"), fileUploadMiddleware, updatePassenger);

export default router;
