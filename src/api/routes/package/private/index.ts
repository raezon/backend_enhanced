import { PackageController } from "@/core/interfaces/controllers/package.ctrl";
import express from "express";
const router = express.Router();

const { createPackage } = PackageController;
router.post("", createPackage);

export default router;
