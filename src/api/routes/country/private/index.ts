import { prisma } from "@/config";
import express, { Request, Response } from "express";
const router = express.Router();

router.get("", async (_req: Request, res: Response) => {
    const data = await prisma.country.findMany();

    res.status(200).json({
        message: "got all countries",
        data,
    });
});

export default router;
