import { TryCatchBlock } from "@/core/app/base/try-catch-block";
import { packageService } from "@/core/app/services/package.service";
import { Request, Response } from "express";

export const packageController = {
    createPackage: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await packageService.createPackage(req.body);

        res.status(201).json({
            message: "Package created successfully",
            data,
        });
    }),

    getPackageById: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await packageService.getPackageById(req.params.id);

        res.status(200).json({
            message: "Package retrieved successfully",
            data,
        });
    }),

    getAllPackages: TryCatchBlock(async (_req: Request, res: Response) => {
        const data = await packageService.getAllPackages();

        res.status(200).json({
            message: "Packages retrieved successfully",
            data,
        });
    }),

    updatePackage: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await packageService.updatePackage(req.params.id, req.body);

        res.status(200).json({
            message: "Package updated successfully",
            data,
        });
    }),

    deletePackage: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await packageService.deletePackage(req.params.id);

        res.status(200).json({
            message: "Package deleted successfully",
            data,
        });
    }),
};
