import { TryCatchBlock } from "@/core/app/base/try-catch-block";
import { AgencyService } from "@core/app/services/agency.service";
import { Request, Response } from "express";

export const AgencyController = {
    createNewAgency: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await AgencyService.createNewAgency(req.body);
        res.status(201).json({
            message: "Agency created successfully",
            data,
        });
    }),
    getAllAgencies: TryCatchBlock(async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;

        const data = await AgencyService.getAllAgencies({
            limit: Number(limit),
            page: Number(page),
        });

        res.status(200).json({
            message: "Agencies retrieved successfully",
            data,
        });
    }),
    getAgencyById: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await AgencyService.getAgencyById({
            id: req.params.id,
        });

        res.status(200).json({
            message: "Agency retrieved successfully",
            data,
        });
    }),

    createNewAccounting: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await AgencyService.createNewAccountingAgency(req.body);
        res.status(201).json({
            message: "Accounting agency created successfully",
            data,
        });
    }),
    createAuthorization: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await AgencyService.createAuthorization(req.body);
        res.status(201).json({
            message: "Authorization created successfully",
            data,
        });
    }),
    createAgencyProduct: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await AgencyService.createAgencyProduct(req.body);
        res.status(201).json({
            message: "Agency product created successfully",
            data,
        });
    }),
    createB2b: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await AgencyService.createB2b(req.body);
        res.status(201).json({
            message: "B2B created successfully",
            data,
        });
    }),
};
