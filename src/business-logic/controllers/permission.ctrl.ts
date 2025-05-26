import { Request, Response } from "express";
import { TryCatchBlock } from "../app/base/try-catch-block";
import { permissionRepo } from "@business/models/permission.repo";

export const PermissionController = {
    createNewPermission: TryCatchBlock(async (req:Request , res: Response)=>{

    const data = await permissionRepo.create(req.body );

    res.status(200).json({
        message: "Permission created successfully",
        data: data
    });
    }),

    getAllPermissions: TryCatchBlock(async (_req:Request , res: Response)=>{
        const data = await permissionRepo.findAll();

        res.status(200).json({
            message: "Permissions fetched successfully",
            data: data
        });
    }),
}