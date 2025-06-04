import upload, { fileUploadMiddleware } from "@/config/multer";
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
    addAgencyLogo,
} = AgencyController;

router.post("/", createNewAgency);
router.get("/", getAllAgencies);
router.get("/:id", getAgencyById);
router.post("/:id/accounting", createNewAccounting);
router.post("/:id/authoration", createAuthorization);
router.post("/:id/product", createAgencyProduct);
router.post("/:id/b2c", createB2b);
router.post("/:id/logo", upload.single("logo"), addAgencyLogo);

export default router;
