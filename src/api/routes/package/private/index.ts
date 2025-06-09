import { packageController } from "@/core/interfaces/controllers/package.ctrl";
import { idValidator } from "@/middlewares/id-validator";
import express from "express";
const router = express.Router();

const { createPackage, deletePackage, getAllPackages, getPackageById } = packageController;

router.post("/", createPackage);
router.get("/", getAllPackages);
router.get("/:id", idValidator("id", "Package ID"), getPackageById);
router.delete("/:id", idValidator("id", "Package ID"), deletePackage);

export default router;
