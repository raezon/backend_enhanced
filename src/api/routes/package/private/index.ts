import { fileUploadMiddleware } from "@/config/multer";
import { PackageController } from "@/core/interfaces/controllers/package.ctrl";
import { idValidator } from "@/middlewares/id-validator";
import express from "express";
const router = express.Router();

const { createPackage, addImages, createAvailableSlots } = PackageController;
router.post("", createPackage);
router.post("/:id", idValidator("id", "Package ID"), fileUploadMiddleware, addImages);
router.post("/:id/slots", idValidator("id", "Package ID"), createAvailableSlots);

export default router;
