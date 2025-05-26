import { PermissionController } from "@business/controllers/permission.ctrl";

import { Router } from "express";
const router = Router();
const {getAllPermissions , createNewPermission} = PermissionController;

router.get("/", getAllPermissions);
router.post("/", createNewPermission);

export default router;