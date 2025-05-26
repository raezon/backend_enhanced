import { Request, Response } from "express";
import { TryCatchBlock } from "../app/base/try-catch-block";
import { userRepo } from "../models";
import bcrypt from "bcrypt";

export const userController = {
    createUser: TryCatchBlock(async (req: Request, res: Response) => {
        const object = req.body;
        const hashedPassword = await bcrypt.hash(object.password, 10);

        const newUser = await userRepo.CreateNewUser({
            ...object,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "User created successfully",
            data: {
                ...newUser,
            },
        });
    }),
    getAllUsers: TryCatchBlock(async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        const users = await userRepo.findAllUsers({
            page: Number(page),
            limit: Number(limit) as 10 | 5 | 25 | 100,
        });

        res.status(200).json({
            message: "Users retrieved successfully",
            data: users,
        });
    }),
    getUserById: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;
        const user = await userRepo.findUserById({ id });

        if (!user) {
            res.status(404).json({
                message: "User not found",
                error: {
                    code: "USER_NOT_FOUND",
                    details: "The user with the given ID does not exist",
                },
            });
            return;
        }

        res.status(200).json({
            message: "User retrieved successfully",
            data: user,
        });
    }),
    deleteUser: TryCatchBlock((req: Request, res: Response) => {
        const { id } = req.params;

        userRepo.deleteUser({ id });

        res.status(200).json({
            message: "User deleted successfully",
        });
    }),
};
