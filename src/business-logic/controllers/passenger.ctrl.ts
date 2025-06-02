import { Request, Response } from "express";
import { TryCatchBlock } from "../app/base/try-catch-block";
import { validate as isValidUuid } from "uuid";
import { ConstraintError } from "../app/base/constraint-error";
import { passengerRepo } from "../models/passengers.repo";

export const PassengerController = {
    createPassenger: TryCatchBlock(async (req: Request, res: Response) => {
        console.log("Incoming request to create passenger:", {
            body: req.body,
            files: req.files,
        });
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw new ConstraintError(
                "No documents uploaded",
                400,
                "MISSING_DOCUMENTS",
                "At least one document is required"
            );
        }

        const files = req.files as Express.Multer.File[];
        const { visaRequestId, ...inputData } = req.body;
        console.log("Extracted visaRequestId:", visaRequestId);
        console.log("Extracted inputData:", inputData);

        if (
            !visaRequestId ||
            typeof visaRequestId !== "string" ||
            visaRequestId.trim() === "" ||
            !isValidUuid(visaRequestId)
        ) {
            console.error("Visa Request ID validation failed:", visaRequestId);
            throw new ConstraintError(
                "Visa Request ID validation failed",
                400,
                "INVALID_INPUT",
                "Visa Request ID must be a valid UUID string"
            );
        }

        console.log("Checking if Visa Request exists with ID:", visaRequestId);
        const visaRequestExists = await passengerRepo.visaRequestExists(visaRequestId);
        console.log("Visa Request existence check result:", visaRequestExists);

        if (!visaRequestExists) {
            console.error(`Visa Request with ID ${visaRequestId} not found`);
            throw new ConstraintError(
                "Visa Request not found",
                404,
                "RESOURCE_NOT_FOUND",
                `Visa Request with ID ${visaRequestId} not found`
            );
        }

        const requiredFields = [
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

        console.log("Validating required fields...");
        for (const field of requiredFields) {
            if (!inputData[field]) {
                console.error(`Missing required field: ${field}`);
                throw new ConstraintError(
                    "Missing required field",
                    400,
                    "MISSING_REQUIRED_FIELD",
                    `${field} is required`
                );
            }
        }

        console.log("Calling passengerRepo.create with data...");
        const data = await passengerRepo.create({
            visaRequestId,
            files,
            ...inputData,
        });

        console.log("Passenger creation successful:", data);

        res.status(201).json({
            message: "Passenger created successfully",
            data,
        });
    }),

    updatePassenger: TryCatchBlock(async (req: Request, res: Response) => {
        console.log("Incoming request to update passenger:", {
            params: req.params,
            body: req.body,
            files: req.files,
        });

        const passengerId = req.params.id;

        // 1) Validate passenger ID
        if (!passengerId || !isValidUuid(passengerId)) {
            console.error("Invalid Passenger ID:", passengerId);
            throw new ConstraintError(
                "Invalid Passenger ID",
                400,
                "INVALID_INPUT",
                "Passenger ID must be a valid UUID"
            );
        }

        // 2) Check if passenger exists
        const existingPassenger = await passengerRepo.findById(passengerId);
        if (!existingPassenger) {
            console.error(`Passenger with ID ${passengerId} not found`);
            throw new ConstraintError(
                "Passenger not found",
                404,
                "RESOURCE_NOT_FOUND",
                `Passenger with ID ${passengerId} not found`
            );
        }

        // 3) Destructure deletedDocs and collect incoming files
        const { deletedDocs, ...updateData } = req.body;
        const files = (req.files as Express.Multer.File[]) || [];

        // 4) Parse deletedDocs if provided
        let parsedDeletedDocs: string[] = [];
        if (deletedDocs) {
            try {
                parsedDeletedDocs = Array.isArray(deletedDocs)
                    ? (deletedDocs as string[])
                    : JSON.parse(deletedDocs as string);
            } catch (parseErr) {
                console.error("Invalid deletedDocs format:", deletedDocs);
                throw new ConstraintError(
                    "Invalid deletedDocs format",
                    400,
                    "INVALID_INPUT",
                    "deletedDocs must be a valid JSON array of document IDs"
                );
            }
        }

        // 5) If no new files and no deletedDocs, then there’s nothing to update
        if (files.length === 0 && parsedDeletedDocs.length === 0) {
            console.error("No files to add or delete provided for update");
            throw new ConstraintError(
                "Nothing to update",
                400,
                "MISSING_DOCUMENTS",
                "You must provide at least one new file (documents) or a deletedDocs array"
            );
        }

        // 6) Convert any date‐string fields in updateData into actual Date objects
        const dateFields = ["dateOfBirth", "passportDeliveryDate", "passportExpirationDate"];
        for (const field of dateFields) {
            if (updateData[field]) {
                updateData[field] = new Date(updateData[field] as string);
            }
        }

        // 7) Perform the update via the repo
        console.log("Calling passengerRepo.update with:", {
            passengerId,
            updatePayload: {
                ...updateData,
                files,
                deletedDocs: parsedDeletedDocs,
            },
        });

        const updatedPassenger = await passengerRepo.update(passengerId, {
            ...updateData,
            files,
            deletedDocs: parsedDeletedDocs,
        });

        console.log("Passenger updated successfully:", updatedPassenger);
        res.status(200).json({
            message: "Passenger updated successfully",
            data: updatedPassenger,
        });
    }),
    deletePassenger: TryCatchBlock(async (req: Request, res: Response) => {
        const passengerId = req.params.id;

        // Validate passenger ID
        if (!passengerId || !isValidUuid(passengerId)) {
            throw new ConstraintError(
                "Invalid Passenger ID",
                400,
                "INVALID_INPUT",
                "Passenger ID must be a valid UUID"
            );
        }

        // Check if passenger exists
        const existingPassenger = await passengerRepo.findById(passengerId);
        if (!existingPassenger) {
            throw new ConstraintError(
                "Passenger not found",
                404,
                "RESOURCE_NOT_FOUND",
                `Passenger with ID ${passengerId} not found`
            );
        }

        // Perform deletion
        await passengerRepo.delete(passengerId);

        res.status(200).json({
            message: "Passenger deleted successfully",
            data: { id: passengerId },
        });
    }),
};
