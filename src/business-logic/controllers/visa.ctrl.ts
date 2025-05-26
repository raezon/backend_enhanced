import { Request, Response } from "express";
import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { visaRepo } from "@business/models/visa.repo";
import { ConstraintError } from "@business/app/base/constraint-error";

export const visaCtrl = {
    createNewVisa: TryCatchBlock(async (req:Request, res:Response) => {
        const data = await visaRepo.createVisa(req.body);
        res.status(201).json({
            message: "Visa created successfully",
            data,
        });
    }),

    getVisaById: TryCatchBlock(async (req:Request, res:Response) => {
        const data = await visaRepo.getVisaById({id: req.params.id});

        if(!data) {
            throw  new ConstraintError("Visa not found", 404 , "NOT_FOUND" , "Visa not found");
        }

        res.status(200).json({
            message: "Visa retrieved successfully",
            data,
        });
    }),

    updateVisa: TryCatchBlock(async (req:Request, res:Response) => {
        const data = await visaRepo.updateVisa(req.params.id, req.body);
        res.status(200).json({
            message: "Visa updated successfully",
            data,
        });
    }),

    deleteVisa: TryCatchBlock(async (req:Request, res:Response) => {
        await visaRepo.deleteVisa(req.params.id);
        res.status(200).json({
            message: "Visa deleted successfully",
        });
    }),

    getAllVisas: TryCatchBlock(async (req:Request, res:Response) => {
        const { page = 1, pageSize = 10, countryId } = req.query;
        const data = await visaRepo.findAllVisas({
            page: Number(page),
            pageSize: Number(pageSize),
            countryId: typeof countryId === 'string' ? countryId : undefined,
        });
        res.status(200).json({
            message: "Visas retrieved successfully",
            data,
        });
    })
}