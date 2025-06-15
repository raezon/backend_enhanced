import printf from "@/scripts/printf";
import { ConstraintError } from "./constraint-error";
import { Request, RequestHandler, Response, NextFunction } from "express";

export const TryCatchBlock = (fn: RequestHandler): RequestHandler => {
    return (async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error: unknown) {
            printf.error(`Error caught in TryCatchBlock: ${JSON.stringify(error)}`);
            console.error(`Error caught in TryCatchBlock: ${error}`);

            if (error instanceof ConstraintError) {
                return res.status(error.status).json({
                    message: error.message,
                    error: {
                        code: error.code,
                        details: error.details,
                    },
                });
            }

            return res.status(500).json({
                message: "Internal Server Error",
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    details: "An unexpected error occurred",
                },
            });
        }
    }) as RequestHandler;
};
