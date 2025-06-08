import { Prisma } from "@prisma/client";
import { ConstraintError } from "../base/constraint-error";
import { visaRepo } from "@/core/infrastructure/repositories/visa.repo";
import { validate as isValidUuid } from "uuid";
import { visaBookingRepo } from "@/core/infrastructure/repositories/visa-booking.repo";
import { passengerRepo } from "@/core/infrastructure/repositories/passenger.repo";

export const VisaBookingService = {
    getVisaBookingById: async ({ id }: { id: string | undefined }) => {
        if (!id || typeof id !== "string" || id.trim() === "" || !isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "VALIDATION_ERROR",
                "Visa ID must be a valid UUID"
            );
        }

        const data = await visaBookingRepo.findOne({
            id,
        });

        if (!data) {
            throw new ConstraintError(
                "Booked Visa not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This BOOKED VISA could not be found`
            );
        }

        const passengers = await passengerRepo.findAll({ visaRequestId: data.visaRequest.id });

        return {
            basicInfos: {
                id: data.id,
                country: data.visa.country,
                travelStartingDate: data.visaRequest.travelStartingDate,
                groupSize: data.visaRequest.groupSize,
                status: data.visaRequest.status,
                nationality: data.visaRequest.nationality,
                totalPrice: data.visaRequest.totalPrice,
                agencyName: data.visaRequest.agencyName,
                agentName: data.visaRequest.agentName,
                name: data.visa.name,
                notes: data.visaRequest.notes,
            },
            passengers,
        };
    },

    getAllVisaBookings: async ({ limit, page }: { page: number; limit: number }) => {
        return visaBookingRepo.findAll({ limit, page });
    },
    requestVisa: async (
        inputData: Prisma.VisaRequestCreateInput & { visaId: string; files: Express.Multer.File[] }
    ) => {
        const { visaId, ...rest } = inputData;
        if (!visaId || typeof visaId !== "string" || visaId.trim() === "" || !isValidUuid(visaId)) {
            throw new ConstraintError(
                "Visa ID validation failed",
                400,
                "INVALID_INPUT",
                "Visa ID must be provided as a non-empty string"
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
            if (rest[field] === undefined) {
                throw new ConstraintError(
                    "Missing required field",
                    400,
                    "MISSING_REQUIRED_FIELD",
                    `${field} is a required field`
                );
            }
        }

        const groupSizeNum = rest.groupSize;
        if (isNaN(groupSizeNum) || groupSizeNum <= 0) {
            throw new ConstraintError(
                "Invalid group size",
                400,
                "VALIDATION_ERROR",
                "Group size must be a positive integer"
            );
        }

        const travelDate = new Date(rest.travelStartingDate);
        if (isNaN(travelDate.getTime())) {
            throw new ConstraintError(
                "Invalid date",
                400,
                "INVALID_DATE",
                "travelStartingDate must be a valid ISO date"
            );
        }

        const documentFiles = (rest.files as Express.Multer.File[]) || [];
        const documentPaths = documentFiles.map((file) => file.path);

        const visaExists = await visaRepo.exists({ id: visaId });

        if (!visaExists) {
            throw new ConstraintError(
                "Booked Visa not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This BOOKED VISA could not be found`
            );
        }

        const data = await visaBookingRepo.create({
            ...inputData,
            documents: documentPaths,
        });

        return data;
    },

    deleteVisaRequest: async ({ id }: { id: string | undefined }) => {
        if (!id || typeof id !== "string" || id.trim() === "" || !isValidUuid(id)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "VALIDATION_ERROR",
                "Visa ID must be a valid UUID"
            );
        }

        const data = await visaBookingRepo.findOne({
            id,
        });

        if (!data) {
            throw new ConstraintError(
                "Booked Visa not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This BOOKED VISA could not be found`
            );
        }

        await visaBookingRepo.delete({
            id,
        });
    },

    updateVisa: async (
        inputData: Prisma.VisaRequestUpdateInput & { visaId: string; id: string }
    ) => {
        const { visaId, id, ...rest } = inputData;
        if (!visaId || typeof visaId !== "string" || visaId.trim() === "" || !isValidUuid(visaId)) {
            throw new ConstraintError(
                "Invalid ID format",
                400,
                "VALIDATION_ERROR",
                "Visa ID must be a valid UUID"
            );
        }

        if (
            typeof inputData !== "object" ||
            inputData === null ||
            Object.keys(inputData).length === 0
        ) {
            throw new ConstraintError(
                "Invalid request body",
                400,
                "INVALID_REQUEST_BODY",
                "Request body must be a non-empty object with update fields"
            );
        }

        const allowedFields = ["travelStartingDate", "status", "nationality", "notes"];

        const invalidFields = Object.keys(rest).filter((field) => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            throw new ConstraintError(
                "Invalid fields in request",
                400,
                "INVALID_FIELDS",
                `The following fields cannot be updated: ${invalidFields.join(", ")}`
            );
        }

        const isExist = await visaBookingRepo.exists({ id });

        if (!isExist) {
            throw new ConstraintError(
                "Visa request not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Visa request does not exist`
            );
        }
    },
};
