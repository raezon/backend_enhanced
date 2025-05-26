import { userController } from "@/business-logic/controllers/user.ctrl";
import { Router } from "express";
const router = Router();
const { createUser, deleteUser, getAllUsers, getUserById } = userController;

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;
