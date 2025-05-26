import { Request, Response } from "express";
import winston from "@utils/winston";

export const healthCheck = (_req: Request, res: Response) => {
    try {
        res.status(200).json({
            status: "healthy",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        winston.error(`Health check failed: ${error}`);
    }
};
