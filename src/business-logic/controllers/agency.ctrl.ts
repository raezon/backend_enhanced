import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { Request, Response } from "express";
import { agencyRepo } from "@business/models/agency.repo";
import { ConstraintError } from "@business/app/base/constraint-error";

export const agencyController = {
    createNewAgency : TryCatchBlock(async (req:Request , res:Response) => {
        const data = await agencyRepo.createAgency(req.body);
        res.status(201).json({
            message: "Agency created successfully",
            data,
        });
    }),
    createNewAccountingAgency : TryCatchBlock(async (req:Request , res:Response) => {
        const data = await agencyRepo.createAccountingAgency(req.body);
        res.status(201).json({
            message: "Accounting agency created successfully",
            data,
        });
    }),

    createAuthorization : TryCatchBlock(async (req:Request , res:Response) => {
        const data = await agencyRepo.createAuthorizationAgency(req.body);
        res.status(201).json({
            message: "Authorization created successfully",
            data,
        });
    }),

    createAgencyProduct : TryCatchBlock(async (req:Request , res:Response) => {
        const data = await agencyRepo.createAgencyProduct(req.body);
        res.status(201).json({
            message: "Agency product created successfully",
            data,
        });
    }),

    createB2b : TryCatchBlock(async (req:Request , res:Response) => {
        const data = await agencyRepo.createB2bAgency(req.body);
        res.status(201).json({
            message: "B2B created successfully",
            data,
        });
    }),

    getAgencyById : TryCatchBlock(async (req:Request , res:Response) => {
        const { id } = req.params;
        const data = await agencyRepo.findAgencyById({ id });
        if (!data) {
            throw new ConstraintError("Agency not found", 404 , "NOT_FOUND" , "Agency not found");
        }
        res.status(200).json({
            message: "Agency retrieved successfully",
            data,
        });
    }),
}