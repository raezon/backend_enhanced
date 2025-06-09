import { prisma } from "@/config";
import express, { Request, Response } from "express";
const router = express.Router();

router.get("", async (req: Request, res: Response) => {
    const offers = req.query.offers === "true";

    let data: any[] = [];

    if (offers) {
        data = await prisma.country.findMany({
            where: {
                visa: {
                    some: {}, // means at least one visa
                },
            },
            include: {
                visa: true, // include visa data if needed
            },
        });
    } else {
        data = await prisma.country.findMany();
    }

    res.status(200).json({
        message: "got all countries",
        data,
    });
});

export default router;
