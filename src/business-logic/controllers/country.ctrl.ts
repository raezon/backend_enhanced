import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { Request, Response } from "express";
import { countryRepo } from "@business/models/country.repo";
import { ConstraintError } from "@business/app/base/constraint-error";
import { validate as isValidUuid } from "uuid";

export const countryController = {
    createCountry: TryCatchBlock(async (req: Request, res: Response) => {
        const requiredFields = ["flagUrl", "embassyLocation", "name"];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new ConstraintError(
                    "Missing required field",
                    400,
                    "MISSING_REQUIRED_FIELD",
                    `${field} is a required field`
                );
            }
        }
        const data = await countryRepo.create(req.body);

        res.status(201).json({
            message: "Created a country successfully",
            data,
        });
    }),

    getCountry: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "VALIDATION_ERROR",
                "Visa ID must be a valid UUID"
            );
        }

        const data = await countryRepo.findById({ id });
        if (!data) {
            throw new ConstraintError(
                "Could not find country",
                404,
                "NOT_FOUND",
                "Could not find country"
            );
        }

        res.status(200).json({
            data,
            message: "Successfully created country",
        });
    }),

    getAllCountry: TryCatchBlock(async (req: Request, res: Response) => {
        const data = await countryRepo.findAll();
        res.status(200).json({
            data,
            message: "Successfully created country",
        });
    }),

    updateCountry: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "VALIDATION_ERROR",
                "Visa ID must be a valid UUID"
            );
        }

        const existingCountry = await countryRepo.findById({ id });

        if (!existingCountry) {
            throw new ConstraintError(
                "Country not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Country does not exist`
            );
        }

        if (
            typeof req.body !== "object" ||
            req.body === null ||
            Object.keys(req.body).length === 0
        ) {
            throw new ConstraintError(
                "Invalid request body",
                400,
                "INVALID_REQUEST_BODY",
                "Request body must be a non-empty object with update fields"
            );
        }

        const allowedFields = [
            "name",
            "flagUrl",
            "embassyLocation",
            "embassyWebsite",
            "embassyPhone",
            "embassyEmail",
            "embassyFax",
            "embassyHours",
        ];

        const invalidFields = Object.keys(req.body).filter(
            (field) => !allowedFields.includes(field)
        );

        if (invalidFields.length > 0) {
            throw new ConstraintError(
                "Invalid fields in request",
                400,
                "INVALID_FIELDS",
                `The following fields cannot be updated: ${invalidFields.join(", ")}`
            );
        }

        const data = await countryRepo.update(req.body, id);

        res.status(200).json({
            data,
            message: "Successfully updated country",
        });
    }),
};
