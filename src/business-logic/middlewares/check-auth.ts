import { NextFunction, Request, Response } from "express";
import { TryCatchBlock } from "../app/base/try-catch-block";
import ENV from "@/config/env";
import { User } from "../constants/api.dto";
import { verifyAuthorization } from "@/utils/verify-auth";

export type RequestWithAuth = Request & { user: User };

export const checkAuth = TryCatchBlock(async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers[ENV.TOKEN_HIDEOUT] as string | undefined;
    const calledUrl = req.originalUrl;
    
    const obj = await verifyAuthorization({
        authHeader,
        flashAll: calledUrl === "/api/private/client/sign-out",
    });

    if (obj) {
        (req as RequestWithAuth).user = obj.user;
        next();
    }
});
