import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { Request, Response } from "express";
import { visaBookingRepo } from "@business/models/visa-booking.repo";
import { validate as isValidUuid } from "uuid";
import { ConstraintError } from "../app/base/constraint-error";

export const visaBookingController = {
    requestVisa: TryCatchBlock(async (req: Request, res: Response) => {
        const { visaId } = req.body;

        if (!visaId || typeof visaId !== "string" || visaId.trim() === "" || !isValidUuid(visaId)) {
            throw new ConstraintError(
                "Country ID validation failed",
                400,
                "INVALID_INPUT",
                "Country ID must be provided as a non-empty string"
            );
        }

        const requiredFields = [
            "agentName",
            "agencyName",
            "travelStartingDate",
            "groupSize",
            "nationality",
            "totalPrice",
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

        const groupSizeNum = parseInt(req.body.groupSize);
        if (isNaN(groupSizeNum) || groupSizeNum <= 0) {
            throw new ConstraintError(
                "Invalid group size",
                400,
                "VALIDATION_ERROR",
                "Group size must be a positive integer"
            );
        }

        const travelDate = new Date(req.body.travelStartingDate);
        if (isNaN(travelDate.getTime())) {
            throw new ConstraintError(
                "Invalid date",
                400,
                "INVALID_DATE",
                "travelStartingDate must be a valid ISO date"
            );
        }

        const documentFiles = (req.files as Express.Multer.File[]) || [];
        const documentPaths = documentFiles.map((file) => file.path);

        const data = await visaBookingRepo.createVisaBooking({
            ...req.body,
            documents: documentPaths,
        });

        res.status(201).json({
            message: "Visa booking request created successfully",
            data,
        });
    }),

    getAllVisaBookings: TryCatchBlock(async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        const data = await visaBookingRepo.getAllVisaBookings({
            page: Number(page),
            limit: Number(limit),
        });
        res.status(200).json({
            message: "Visa bookings retrieved successfully",
            data,
        });
    }),

    getVisaBookingById: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;

        console.log("id ", id);

        if (!isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "VALIDATION_ERROR",
                "Visa ID must be a valid UUID"
            );
        }

        const data = await visaBookingRepo.getVisaBookingById(id);
        console.log("data", data);

        if (!data) {
            console.log("data", data);

            throw new ConstraintError(
                "Booked Visa not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This BOOKED VISA could not be found`
            );
        }

        res.status(200).json({
            message: "Visa booking retrieved successfully",
            data,
        });
    }),

    updateVisaBooking: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "VALIDATION_ERROR",
                "Visa ID must be a valid UUID"
            );
        }

        const data = await visaBookingRepo.updateVisaBookingById(req.body, id);
        res.status(200).json({
            message: "Visa booking updated successfully",
            data,
        });
    }),

    deleteVisaBooking: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "VALIDATION_ERROR",
                "Visa ID must be a valid UUID"
            );
        }

        const data = await visaBookingRepo.getVisaBookingById(id);

        if (!data) {
            throw new ConstraintError(
                "Booked Visa not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This BOOKED VISA could not be found`
            );
        }

        await visaBookingRepo.deleteVisaBookingById(id);
        res.status(204).json({
            message: "Visa booking deleted successfully",
        });
    }),
};
