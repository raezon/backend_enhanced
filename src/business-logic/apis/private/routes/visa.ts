
import { Router } from "express";
import { visaCtrl } from "@business/controllers/visa.ctrl";
const router = Router();
const {getVisaById , deleteVisa , updateVisa , getAllVisas ,createNewVisa} = visaCtrl

router.post("/" , createNewVisa);
router.get("/" , getAllVisas);
router.get("/:id" , getVisaById);
router.put("/:id" , updateVisa);
router.delete("/:id" , deleteVisa);

export default router;