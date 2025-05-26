import { feesRepo } from "@business/models/fees.repo";
import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { Request, Response } from "express";
import { ConstraintError } from "@business/app/base/constraint-error";


export const feesController = {
    createNewServiceFee : TryCatchBlock(async (req:Request , res:Response)=>{
        const data = await feesRepo.createBasic(req.body);

        res.status(201).json(
            {
                message : "Service fee created successfully",
                data
            }
        )
    }),

    getAllServiceFees : TryCatchBlock(async (req:Request , res:Response)=>{

        const data = await feesRepo.getAll({
            limit:Number(req.query.limit),
            page:Number(req.query.page)
        });

        res.status(200).json({
            message : "Service fees retrieved successfully",
            data
        })
    }),

    createNewItinerary : TryCatchBlock(async (req:Request , res:Response)=>{

        const data = await feesRepo.createItinerary(req.body);

        res.status(201).json(
            {
                message : "Itinerary created successfully",
                data
            }
        )
    }),

    createNewAccounting : TryCatchBlock(async (req:Request, res:Response) => {
        const data = await feesRepo.createAccounting(req.body);
        res.status(201).json(
            {
                message : "accounting created successfully",
                data
            }
        )

    }),

    findServiceFeeById : TryCatchBlock(async (req:Request , res:Response)=>{
        const data = await  feesRepo.findServiceFeesById({id:req.params.id});

        if(!data){
            throw new ConstraintError("Service fee not found" , 404 , "NOT_FOUND" , "Service fee not found")
        }

        res.status(200).json({
            message : "Service fee retrieved successfully",
            data,
        })
    })

}