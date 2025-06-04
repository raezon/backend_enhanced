import { VisaController } from "@/core/interfaces/controllers/visa.ctrl";
import express from "express";
const router = express.Router();

const { createNewVisa, deleteVisa, getAllVisas, getVisaById, updateVisa } = VisaController;

router.get("", getAllVisas);
router.post("", createNewVisa);
router.get(":id", getVisaById);
router.put(":id", getVisaById);
router.delete(":id", deleteVisa);

export default router;
