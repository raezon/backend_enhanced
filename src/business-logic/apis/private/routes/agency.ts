import { Router } from "express";
const router = Router();
import { agencyController } from "@business/controllers/agency.ctrl";
const { createNewAgency , createNewAccountingAgency , createAgencyProduct , createAuthorization , createB2b , getAgencyById } = agencyController;

router.post("/", createNewAgency);
router.post("/accounting", createNewAccountingAgency);
router.post("/product", createAgencyProduct);
router.post("/authorization", createAuthorization);
router.post("/b2b", createB2b);
router.get("/:id", getAgencyById);

export default router;
