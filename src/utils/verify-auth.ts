import { ConstraintError } from "@/business-logic/app/base/constraint-error";
import { userRepo } from "@/business-logic/models";
import TokenService from "@/business-logic/services/jwt";
import ENV from "@/config/env";
import { rateLimitRedis } from "@/config/redis";
import { TokenExpiredError } from "jsonwebtoken";

export const verifyAuthorization = async ({
    authHeader,
    flashAll = false,
}: {
    authHeader: string | undefined;
    flashAll?: boolean;
}) => {

    if (!authHeader) {
        throw new ConstraintError(
            "Authentication failed",
            403,
            "VALIDATION_ERROR",
            "No token provided"
        );
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== ENV.AUTH_BEARER || !token) {
        throw new ConstraintError(
            "Authentication failed",
            403,
            "VALIDATION_ERROR",
            "Invalid token format"
        );
    }

    try {
        const exists = await (await rateLimitRedis).client.exists(token);
        if (exists) {
            throw new ConstraintError(
                "Authentication failed",
                403,
                "VALIDATION_ERROR",
                "Token blacklisted"
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

        if (flashAll === true) {
          (await rateLimitRedis).client.set(token, "blacklisted");
        }

        return { user };
    } catch (err: unknown) {
        console.log("err" , err);

        if (err instanceof TokenExpiredError) {
            throw new ConstraintError("Token expired", 403, "VALIDATION_ERROR", "Token expired");
        } else if (err instanceof ConstraintError) {
            throw new ConstraintError(err.message, err.status, err.code, err.details);
        } else {
            throw new ConstraintError("Invalid token", 403, "VALIDATION_ERROR", "Invalid token");
        }
    }
};
