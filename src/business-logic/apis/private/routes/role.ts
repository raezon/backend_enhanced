import { Router } from "express";
import { RoleController } from "@business/controllers/role.ctrl";
const router = Router();
const {createNewRole , getAllRoles} = RoleController

router.post("/", createNewRole);
router.get("/", getAllRoles);

export default router;
