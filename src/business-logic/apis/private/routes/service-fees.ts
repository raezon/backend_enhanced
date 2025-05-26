import { Router } from "express";
import { feesController } from "@business/controllers/fees.ctrl";
const router = Router();

const {createNewItinerary , createNewAccounting ,createNewServiceFee ,getAllServiceFees ,findServiceFeeById} = feesController

router.post("/" , createNewServiceFee);
router.get("/" , getAllServiceFees);
router.get("/:id" , findServiceFeeById);

router.post("/itinerary" , createNewItinerary);
router.post("/accounting" , createNewAccounting);

export default router;