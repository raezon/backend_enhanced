import { VisaController } from "@/core/interfaces/controllers/visa.ctrl";
import { idValidator } from "@/middlewares/id-validator";
import express from "express";
const router = express.Router();

const { createNewVisa, deleteVisa, getAllVisas, getVisaById, updateVisa } = VisaController;

router.get("", getAllVisas);
router.post("", createNewVisa);
router.get("/:id", idValidator("id", "Visa ID"), getVisaById);
router.put("/:id", idValidator("id", "Visa ID"), updateVisa);
router.delete("/:id", idValidator("id", "Visa ID"), deleteVisa);

export default router;
