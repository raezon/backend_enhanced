import { PassengerController } from "@/business-logic/controllers/passenger.ctrl";
import { Router } from "express";
const router = Router();

const { createPassenger, deletePassenger, updatePassenger } = PassengerController;

router.post("/", createPassenger);
router.patch("/", updatePassenger);
router.delete("/", deletePassenger);

export default router;
