import { TryCatchBlock } from "@/core/app/base/try-catch-block";
import { RequestWithAuth } from "@/core/app/base/types";
import { PackageService } from "@core/app/services/package.service";
import { Request, Response } from "express";

export const PackageController = {
    createSteps: TryCatchBlock(async (req: Request, res: Response) => {
        const inputData = {
            ...req.body,
            packageId: req.params.id,
        };

        const result = await PackageService.createPackageStep(inputData);

        res.status(201).json({
            message: "Package steps created successfully",
            data: result,
        });
    }),

    createConditions: TryCatchBlock(async (req: Request, res: Response) => {
        const inputData = {
            ...req.body,
            packageId: req.params.id,
        };

        const result = await PackageService.createConditions(inputData);

        res.status(201).json({
            message: "Package conditions created successfully",
            data: result,
        });
    }),

    createAvailableSlots: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await PackageService.createSlotAvailability({
            ...req.body,
            packageId: req.params.id,
        });

        res.status(201).json({
            message: "Created available slots successfully",
            data,
        });
    }),
    createPackage: TryCatchBlock(async (req: Request, res: Response) => {
        const inputData = req.body;

        const { id } = (req as RequestWithAuth).user;
        const result = await PackageService.createNewPackage({ ...inputData, userId: id });

        res.status(201).json({
            message: "Package created successfully",
            data: result,
        });
    }),

    addImages: TryCatchBlock(async (req: Request, res: Response) => {
        const inputData = {
            files: req.files as Express.Multer.File[],
            packageId: req.params.id,
            ...req.body,
        };

        const result = await PackageService.addImages(inputData);

        res.status(201).json({
            message: "Images added successfully",
            data: result,
        });
    }),
};
