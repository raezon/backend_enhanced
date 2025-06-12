import { ConstraintError } from "@/core/app/base/constraint-error";
import { NextFunction, Request, Response } from "express";
import { validate as isValidUuid } from "uuid";

export const idValidator =
    (paramName: string = "id", label = "ID") =>
    (req: Request, _res: Response, next: NextFunction) => {
        const value = req.params[paramName];

        if (!value || typeof value !== "string" || value.trim() === "" || !isValidUuid(value)) {
            throw new ConstraintError(
                `${label} validation failed`,
                400,
                "VALIDATION_ERROR",
                `${label} must be a valid non-empty uuid`
            );
        }
        next();
    };
