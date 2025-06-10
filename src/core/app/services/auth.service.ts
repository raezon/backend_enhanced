import { userRepo } from "@core/infrastructure/repositories/user.repo";
import { ConstraintError } from "../base/constraint-error";
import { Env, redisClient } from "@/config";
import TokenService from "@/services/jwt";
import { TokenExpiredError } from "jsonwebtoken";
import { validateInput } from "@/utils/validate-input";
import { Prisma } from "@prisma/client";
import Joi from "joi";

export const AuthService = {
    refreshUser: async ({ refreshToken }: { refreshToken: string | undefined }) => {
        if (!refreshToken) {
            throw new ConstraintError(
                "Authentication failed",
                401,
                "VALIDATION_ERROR",
                "No token provided"
            );
        }

        const [bearer, token] = refreshToken && refreshToken.split(" ");

        if (bearer !== Env.REFRESH_BEARER || !token) {
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
        const accessToken = TokenService.generateToken(
            { id: user.user.id },
            user.user.role.name,
            "30d"
        );

        return { accessToken };
    },

    authUser: async (inputData: { username: string; password: string }) => {
        const signInSchema = Joi.object({
            username: Joi.string().required().messages({
                "any.required": "Username is required",
            }),
            password: Joi.string().min(6).required().messages({
                "any.required": "Password is required",
                "string.min": "Password must be at least 6 characters",
            }),
        });
        const { username, password } = validateInput<Prisma.UserCreateInput>(
            signInSchema,
            inputData
        );

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

        const isMatch = await isUser.verifyPassword(password);

        if (!isMatch) {
            throw new ConstraintError(
                "Validation error",
                400,
                "VALIDATION_ERROR",
                "Password is incorrect"
            );
        }

        const accessToken = TokenService.generateToken(
            { id: isUser.user.id },
            isUser.user.role.name,
            "30d"
        );
        const refreshToken = TokenService.generateToken(
            { id: isUser.user.id },
            isUser.user.role.name,
            "30d"
        );

        return { accessToken, refreshToken };
    },

    verifyAuthorization: async ({
        authHeader,
        flashAll = false,
    }: {
        authHeader: string | undefined;
        flashAll?: boolean;
    }) => {
        if (!authHeader) {
            throw new ConstraintError(
                "Authorization required",
                401, // Unauthorized
                "AUTH_ERROR",
                "Missing Authorization header"
            );
        }

        const [bearer, token] = authHeader.split(" ");

        if (bearer !== Env.AUTH_BEARER || !token) {
            throw new ConstraintError(
                "Invalid Authorization format",
                400, // Bad Request
                "AUTH_ERROR",
                "Expected format: 'Bearer <token>'"
            );
        }

        try {
            const isBlacklisted = await redisClient.exists(token);
            if (isBlacklisted) {
                throw new ConstraintError(
                    "Access denied",
                    401, // Unauthorized
                    "TOKEN_BLACKLISTED",
                    "This token has been revoked. Please sign in again."
                );
            }

            const decoded = TokenService.verifyToken(token);

            if (!decoded) {
                throw new ConstraintError(
                    "Session expired",
                    401,
                    "TOKEN_EXPIRED",
                    "Your session has expired. Please sign in again."
                );
            }

            const user = await userRepo.findUserById({ id: decoded.id });

            if (!user) {
                throw new ConstraintError(
                    "User not found",
                    404,
                    "USER_NOT_FOUND",
                    "The user associated with this token no longer exists"
                );
            }

            if (flashAll === true) {
                await redisClient.set(token, "blacklisted");
            }

            return { user: user.getData() };
        } catch (err: unknown) {
            if (err instanceof TokenExpiredError) {
                throw new ConstraintError(
                    "Session expired",
                    401,
                    "TOKEN_EXPIRED",
                    "Your session has expired. Please sign in again."
                );
            } else if (err instanceof ConstraintError) {
                throw err;
            } else {
                throw new ConstraintError(
                    "Invalid token",
                    401,
                    "INVALID_TOKEN",
                    "The token provided is malformed or invalid"
                );
            }
        }
    },
};
