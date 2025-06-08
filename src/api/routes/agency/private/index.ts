import upload from "@/config/multer";
import { AgencyController } from "@/core/interfaces/controllers/agency.ctrl";
import { idValidator } from "@/middlewares/id-validator";
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
    addAgencyLogo,
} = AgencyController;

router.post("/", createNewAgency);
router.get("/", getAllAgencies);
router.get("/:id", idValidator("id", "Agency ID"), getAgencyById);
router.post("/:id/accounting", idValidator("id", "Agency ID"), createNewAccounting);
router.post("/:id/authoration", idValidator("id", "Agency ID"), createAuthorization);
router.post("/:id/product", idValidator("id", "Agency ID"), createAgencyProduct);
router.post("/:id/b2c", idValidator("id", "Agency ID"), createB2b);
router.post("/:id/logo", idValidator("id", "Agency ID"), upload.single("logo"), addAgencyLogo);

export default router;
