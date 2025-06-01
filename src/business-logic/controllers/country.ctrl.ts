import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { Request, Response } from "express";
import { countryRepo } from "@business/models/country.repo";

export const countryController = {
    getAllCountry: TryCatchBlock(async (_req: Request, res: Response) => {
        const data = await countryRepo.findAll();
        res.status(200).json({
            data,
            message: "Successfully created country",
        });
    }),
};
