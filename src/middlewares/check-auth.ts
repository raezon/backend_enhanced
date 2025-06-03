import { NextFunction, Request, Response } from "express";
import { TryCatchBlock } from "@/core/app/base/try-catch-block";
import { Env } from "@/config";
import { RequestWithAuth } from "@/core/app/base/types";
import { AuthService } from "@/core/app/services/auth.service";

export const checkAuth = TryCatchBlock(async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers[Env.TOKEN_HIDEOUT] as string | undefined;
    const calledUrl = req.originalUrl;

    const obj = await AuthService.verifyAuthorization({
        authHeader,
        flashAll: calledUrl.includes("sign-out"),
    });

    if (obj) {
        (req as RequestWithAuth).user = obj.user;
        next();
    }
});
