import { Request, Response } from "express";
import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { visaRepo } from "@business/models/visa.repo";
import { ConstraintError } from "@business/app/base/constraint-error";
import { Prisma } from "@prisma/client";
import { validate as isValidUuid } from "uuid";

export const visaCtrl = {
    createNewVisa: TryCatchBlock(async (req: Request, res: Response) => {
        const { countryId } = req.body;

        if (!countryId || typeof countryId !== "string" || countryId.trim() === "") {
            throw new ConstraintError(
                "Country ID validation failed",
                400,
                "INVALID_INPUT",
                "Country ID must be provided as a non-empty string"
            );
        }

        const requiredFields = [
            "name",
            "price",
            "currency",
            "description",
            "conditions",
            "duration",
        ];

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

        // get country data using country ID then validate the if it exists or not

        const createInput: Prisma.VisaCreateInput = {
            ...req.body,
            country: {
                connect: { id: countryId },
            },
        };

        const data = await visaRepo.createVisa(createInput);
        res.status(201).json({
            message: "Visa created successfully",
            data,
        });
    }),

    getVisaById: TryCatchBlock(async (req: Request, res: Response) => {
        const id = req.params.id;

        if (!isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "INVALID_ID_FORMAT",
                "Visa ID must be a valid UUID"
            );
        }

        const data = await visaRepo.getVisaById({ id });

        if (!data) {
            throw new ConstraintError(
                "Visa not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This VISA could not be found`
            );
        }

        res.status(200).json({
            message: "Visa retrieved successfully",
            data,
        });
    }),

    updateVisa: TryCatchBlock(async (req: Request, res: Response) => {
        const id = req.params.id;

        if (!isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "INVALID_ID_FORMAT",
                "Visa ID must be a valid UUID"
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
            "price",
            "currency",
            "description",
            "conditions",
            "duration",
            "status",
            "countryId",
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

        const existingVisa = visaRepo.getVisaById({
            id,
        });

        if (!existingVisa) {
            throw new ConstraintError(
                "Visa not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Visa does not exist`
            );
        }

        const data = await visaRepo.updateVisa(id, req.body);
        res.status(200).json({
            message: "Visa updated successfully",
            data,
        });
    }),

    deleteVisa: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "INVALID_ID_FORMAT",
                "Visa ID must be a valid UUID"
            );
        }

        await visaRepo.deleteVisa(id);
        res.status(200).json({
            message: "Visa deleted successfully",
        });
    }),

    getAllVisas: TryCatchBlock(async (req: Request, res: Response) => {
        const { page = 1, pageSize = 10, countryId } = req.query;
        const data = await visaRepo.findAllVisas({
            page: Number(page),
            pageSize: Number(pageSize),
            countryId: typeof countryId === "string" ? countryId : undefined,
        });
        res.status(200).json({
            message: "Visas retrieved successfully",
            data,
        });
    }),
};
