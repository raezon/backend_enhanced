import { AgencyController } from "@/core/interfaces/controllers/agency.ctrl";
import express from "express";
const router = express.Router();
const {
    createNewAgency,
    getAgencyById,
    getAllAgencies,
    createAgencyProduct,
    createAuthorization,
    createB2b,
    createNewAccounting,
} = AgencyController;

router.post("/", createNewAgency);
router.get("/", getAllAgencies);
router.get("/:id", getAgencyById);
router.post("/product", createAgencyProduct);
router.post("authoration", createAuthorization);
router.post("/b2c", createB2b);
router.post("/accounting", createNewAccounting);

export default router;
