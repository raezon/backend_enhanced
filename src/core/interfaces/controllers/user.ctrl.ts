import { Env } from "@/config";
import { TryCatchBlock } from "@/core/app/base/try-catch-block";
import { AuthService } from "@/core/app/services/auth.service";
import { UserService } from "@core/app/services/user.service";
import { Request, Response } from "express";

export const UserController = {
    changeUserPassword: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await UserService.changeUserPassword({
            password: req.body.password,
            id: req.params.id,
        });

        res.status(200).json({
            message: "Password updated successfully",
            data,
        });
    }),

    createNewUser: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await UserService.createNewUser(req.body);
        res.status(201).json({
            message: "User created successfully",
            data,
        });
    }),
    getAllUsers: TryCatchBlock(async (req: Request, res: Response) => {
        const { limit = 10, page = 1 } = req.query;

        const data = await UserService.getAllUsers({
            limit: Number(limit),
            page: Number(page),
        });

        res.status(200).json({
            message: "Users retrieved successfully",
            data,
        });
    }),
    getUserById: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;

        const data = await UserService.getUserById({
            id,
        });

        res.status(200).json({
            message: "User retrieved successfully",
            data,
        });
    }),

    deleteUser: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;
        await UserService.deleteUser({ id });
        res.status(200).json({
            message: "User deleted successfully",
        });
    }),

    signOut: TryCatchBlock(async (_req: Request, res: Response) => {
        res.clearCookie(Env.REFRESH_HIDEOUT, {
            httpOnly: true,
            secure: true, // Match the original cookie
            sameSite: "none", // Match the original cookie
            path: "/",
        });

        res.status(200).json({
            message: "User signed out successfully",
        });
    }),
    refresh: TryCatchBlock(async (req: Request, res: Response) => {
        const refreshToken = req.cookies[Env.REFRESH_HIDEOUT];
        const { accessToken } = await AuthService.refreshUser({ refreshToken });

        res.status(201).json({
            message: "Token refreshed successfully",
            data: { accessToken },
        });
    }),
    signIn: TryCatchBlock(async (req: Request, res: Response) => {
        const { accessToken, refreshToken } = await AuthService.authUser(req.body);
        res.cookie(Env.REFRESH_HIDEOUT, `${Env.REFRESH_BEARER} ${refreshToken}`, {
            httpOnly: true,
            secure: true,
            sameSite: "none", // Required for cross-origin cookies
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: "/",
            domain: undefined, // Don't set domain for cross-origin
        });
        res.status(200).json({
            message: "User signed in successfully",
            data: { accessToken },
        });
    }),
};
