import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { Request, Response } from "express";
import { roleRepo } from "@business/models/role.repo";

export const RoleController = {
    createNewRole:TryCatchBlock(async (req:Request , res:Response)=>{
        const data = await roleRepo.createRole(req.body);

        res.status(201).json({
            message: "Role created successfully",
            data,
        });
    }),
    getAllRoles:TryCatchBlock(async (req:Request , res:Response)=>{
        const data = await roleRepo.findAll();

        res.status(200).json({
            message: "Roles fetched successfully",
            data,
        });
    }),
}