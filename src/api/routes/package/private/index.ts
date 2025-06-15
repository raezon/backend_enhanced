import upload from "@/config/multer";
import { PackageController } from "@/core/interfaces/controllers/package.ctrl";
import { idValidator } from "@/middlewares/id-validator";
import express from "express";
const router = express.Router();

const {
    createPackage,
    addImages,
    createAvailableSlots,
    createConditions,
    createSteps,
    getPackageById,
} = PackageController;
router.post("/step-one", createPackage);
router.post(
    "/:id/step-two",
    idValidator("id", "Package ID"),
    upload.array("package-images"),
    addImages
);
router.post("/:id/step-three", idValidator("id", "Package ID"), createAvailableSlots);
router.post("/:id/step-four", upload.any(), idValidator("id", "Package ID"), createSteps);
router.post("/:id/step-five", idValidator("id", "Package ID"), createConditions);
router.get("/:id", idValidator("id", "Package ID"), getPackageById);

export default router;
