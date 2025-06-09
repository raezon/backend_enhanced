import { PassengerController } from "@/core/interfaces/controllers/passenger.ctrl";
import { idValidator } from "@/middlewares/id-validator";
import express from "express";
const router = express.Router();

const { createPassenger, deletePassenger } = PassengerController;

router.post("/", createPassenger);
router.delete("/:id", idValidator("id", "Passenger ID"), deletePassenger);

export default router;
