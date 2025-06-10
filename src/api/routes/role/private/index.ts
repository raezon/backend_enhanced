import { RoleController } from "@/core/interfaces/controllers/role.ctrl";
import express from "express";
const router = express.Router();

router.get("", RoleController.getAllRoles);

export default router;
