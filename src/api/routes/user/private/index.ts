import express from "express";
const router = express.Router();
import { UserController } from "@/core/interfaces/controllers/user.ctrl";

const { createNewUser, deleteUser, getAllUsers, getUserById, signOut } = UserController;

router.get("/sign-out", signOut);
router.post("/", createNewUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;
