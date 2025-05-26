import { NextFunction, Request, Response, Router } from "express";
import { healthCheck } from "@business/middlewares/health";
import BusinessLogicRoute from "@business/apis/router";

const router = Router();

router.get("/health", healthCheck);
router.use("/api", BusinessLogicRoute);

router.use((_req: Request, _res: Response, next: NextFunction) => {
    next({
        status: 404,
        message: "Not Found",
        error: {
            code: "NOT_FOUND",
            details: "API returned 404 error",
        },
    });
});

// Global error handler middleware
router.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(error.status || 500).json({
        message: error.message || "Internal Server Error",
        error: {
            code: error.error.code || "INTERNAL_SERVER_ERROR",
            details: error.error.details || "Internal Server Error",
        },
    });
    return;
});

export default router;
