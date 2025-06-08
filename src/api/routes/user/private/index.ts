import express from "express";
const router = express.Router();
import { UserController } from "@/core/interfaces/controllers/user.ctrl";
import { idValidator } from "@/middlewares/id-validator";

const { createNewUser, deleteUser, getAllUsers, getUserById, signOut } = UserController;

router.get("/sign-out", signOut);
router.post("/", createNewUser);
router.get("/", getAllUsers);
router.get("/:id", idValidator("id", "User ID"), getUserById);
router.delete("/:id", idValidator("id", "User ID"), deleteUser);

export default router;
