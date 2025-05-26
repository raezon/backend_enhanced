import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { Request, Response } from "express";
import { countryRepo } from "@business/models/country.repo";
import { ConstraintError } from "@business/app/base/constraint-error";

export const countryController = {
    createCountry: TryCatchBlock(async (req:Request , res:Response)=>{
        const data = await countryRepo.create(req.body);

        res.status(201).json({
            message:"Created a country successfully",
            data
        })
    }),

    getCountry: TryCatchBlock(async (req:Request , res:Response)=>{
        const {id} = req.params;
        const data = await countryRepo.findById({id});
        if(!data){
            throw new ConstraintError("Could not find country", 404 , "NOT_FOUND" , "Could not find country");
        }

        res.status(200).json({
            data,
            message:"Successfully created country",
        })
    }),

    getAllCountry: TryCatchBlock(async (req:Request , res:Response)=>{
        const data = await countryRepo.findAll()
        res.status(200).json({
            data,
            message:"Successfully created country",
        })
    }),

    updateCountry: TryCatchBlock(async (req:Request , res:Response)=>{
        const {id} = req.params;
        const data = await countryRepo.update(req.body , id);

        res.status(200).json({
            data,
            message:"Successfully updated country",
        })
    })

}