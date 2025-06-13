import { fileUploadMiddleware } from "@/config/multer";
import { PackageController } from "@/core/interfaces/controllers/package.ctrl";
import { idValidator } from "@/middlewares/id-validator";
import express from "express";
const router = express.Router();

const { createPackage, addImages, createAvailableSlots, createConditions } = PackageController;
router.post("/step-one", createPackage);
router.post("/:id/step-two", idValidator("id", "Package ID"), fileUploadMiddleware, addImages);
router.post("/:id/step-three", idValidator("id", "Package ID"), createAvailableSlots);

router.post("/:id/step-five", idValidator("id", "Package ID"), createConditions);

export default router;
