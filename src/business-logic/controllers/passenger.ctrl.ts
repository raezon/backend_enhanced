import { Request, Response } from "express";
import { TryCatchBlock } from "../app/base/try-catch-block";
import { validate as isValidUuid } from "uuid";
import { ConstraintError } from "../app/base/constraint-error";
import { passengerRepo } from "../models/passengers.repo";

export const PassengerController = {
    createPassenger: TryCatchBlock(async (req: Request, res: Response) => {
        const { visaRequestId } = req.body;

        if (
            !visaRequestId ||
            typeof visaRequestId !== "string" ||
            visaRequestId.trim() === "" ||
            !isValidUuid(visaRequestId)
        ) {
            throw new ConstraintError(
                "Country ID validation failed",
                400,
                "INVALID_INPUT",
                "Country ID must be provided as a non-empty string"
            );
        }

        const visaRequest = await passengerRepo.visaRequestExists(visaRequestId);

        if (!visaRequest) {
            throw new ConstraintError(
                "Visa Request not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Visa Request could not be found`
            );
        }

        const requiredFields = [
            "visaRequestId",
            "name",
            "surname",
            "placeOfBirth",
            "dateOfBirth",
            "passportNumber",
            "passportDeliveryDate",
            "passportExpirationDate",
            "email",
            "phone",
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

        // transaction

        res.status(201).json({
            message: "Passenger created successfully",
            data: {},
        });
    }),
    updatePassenger: TryCatchBlock(async (req: Request, res: Response) => {}),
    deletePassenger: TryCatchBlock(async (req: Request, res: Response) => {}),
};
