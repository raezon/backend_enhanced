import { fileUploadMiddleware } from "@/config/multer";
import { PackageController } from "@/core/interfaces/controllers/package.ctrl";
import { idValidator } from "@/middlewares/id-validator";
import express from "express";
const router = express.Router();

const { createPackage, addImages } = PackageController;
router.post("", createPackage);
router.post("/:id", idValidator("id", "Package ID"), fileUploadMiddleware, addImages);

export default router;
