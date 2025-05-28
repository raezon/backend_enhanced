import { Request, Response } from "express";
import { TryCatchBlock } from "../app/base/try-catch-block";
import { userRepo } from "../models";
import { ConstraintError } from "../app/base/constraint-error";
import bcrypt from "bcrypt";
import TokenService from "../services/jwt";
import ENV from "@/config/env";

export const AuthController = {
    signIn: TryCatchBlock(async (req: Request, res: Response) => {
        const { username, password } = req.body as { username: string; password: string };
        const isUser = await userRepo.findUserByUsername({
            username,
        });

        if (!isUser) {
            throw new ConstraintError(
                "user not found",
                404,
                "USER_NOT_FOUND",
                "User does not exit"
            );
        }

        const match = await bcrypt.compare(password, isUser.password);

        if (!match) {
            throw new ConstraintError(
                "Validation error",
                400,
                "VALIDATION_ERROR",
                "Password is incorrect"
            );
        }
        const { password: _, updatedAt, address, agency, ...user } = isUser;

        const accessToken = TokenService.generateToken({ id: user.id }, user.role, "15m");
        const refreshToken = TokenService.generateToken({ id: user.id }, user.role, "30d");

        res.cookie(ENV.REFRESH_HIDEOUT, `${ENV.REFRESH_BEARER} ${refreshToken}`, {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "User signed in successfully",
            data: { ...user, accessToken },
        });
    }),

    signOut: TryCatchBlock(async (_req: Request, res: Response) => {
        res.clearCookie(ENV.REFRESH_HIDEOUT, {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "none",
        });

        res.status(200).json({
            message: "User signed out successfully",
        });
    }),

    refresh: TryCatchBlock(async (req: Request, res: Response) => {
        const authHeader = req.cookies[ENV.REFRESH_HIDEOUT];

        if (!authHeader) {
            throw new ConstraintError(
                "Authentication failed",
                401,
                "VALIDATION_ERROR",
                "No token provided"
            );
        }

        const [bearer, token] = authHeader && authHeader.split(" ");
        console.log("here", bearer, token);
        if (bearer !== ENV.REFRESH_BEARER || !token) {
            throw new ConstraintError(
                "Authentication failed",
                403,
                "VALIDATION_ERROR",
                "Invalid token format"
            );
        }

        const decoded = TokenService.verifyToken(token) as { id: string; systemRole: string };
        const user = await userRepo.findUserById({ id: decoded.id });
        if (!user) {
            throw new ConstraintError(
                "Authentication failed",
                404,
                "VALIDATION_ERROR",
                "User not found"
            );
        }
        const accessToken = TokenService.generateToken({ id: user.id }, user.role, "15m");

        res.status(200).json({
            message: "Token refreshed successfully",
            data: { accessToken },
        });
    }),
};
