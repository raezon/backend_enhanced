import { TryCatchBlock } from "@/core/app/base/try-catch-block";
import { RequestWithAuth } from "@/core/app/base/types";
import { PackageService } from "@core/app/services/package.service";
import { Request, Response } from "express";

export const PackageController = {

    getAllPackages: TryCatchBlock(async (req: Request, res: Response) => {
        const packages = await PackageService.getAllPackages();
        res.status(200).json({
            message: "Packages retrieved successfully",
            data: packages,
        });
    }),

    getPackageById: TryCatchBlock(async (req: Request, res: Response) => {
        const packageId = req.params.id;
        const packageData = await PackageService.getPackageById(packageId);
        res.status(200).json({
            message: "Package retrieved successfully",
            data: packageData,
        });
    }),

    createSteps: TryCatchBlock(async (req: Request, res: Response) => {
        const reqSteps = JSON.parse(req.body.steps);
        console.log("Received steps:", reqSteps);
        console.log("original steps:", req.body);

        const files = req.files as Express.Multer.File[];

        const steps = reqSteps.map((step, index) => {
            const primaryImage = files.find((f) => f.fieldname === `stepImages-primary-${index}`);

            const secondaryImages = files.filter((f) =>
                f.fieldname.startsWith(`stepImages-secondary-${index}`)
            );

            return {
                ...step,
                primaryImage,
                secondaryImages,
            };
        });

        const inputData = {
            packageId: req.params.id,
            steps,
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
            images: JSON.parse(req.body.images),
        };

        const result = await PackageService.addImages(inputData);

        res.status(201).json({
            message: "Images added successfully",
            data: result,
        });
    }),
};
