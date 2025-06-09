import { Prisma } from "@prisma/client";
import { ConstraintError } from "../base/constraint-error";
import { visaRepo } from "@/core/infrastructure/repositories/visa.repo";
import { validate as isValidUuid } from "uuid";
import { visaBookingRepo } from "@/core/infrastructure/repositories/visa-booking.repo";
import { passengerRepo } from "@/core/infrastructure/repositories/passenger.repo";
import Joi from "joi";
import { validateInput } from "@/utils/validate-input";

export const VisaBookingService = {
    getVisaBookingById: async ({ id }: { id: string }) => {
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
        return await visaBookingRepo.findAll({ limit, page });
    },
    requestVisa: async (
        inputData: Prisma.VisaRequestCreateInput & { visaId: string; files: Express.Multer.File[] }
    ) => {
        const { files, ...rawData } = inputData;

        const visaDetailsSchema = Joi.object({

            agentName: Joi.string().required().messages({
                "any.required": "Agent name is a required field",
            }),

            agencyName: Joi.string().required().messages({
                "any.required": "Agency name is a required field",
            }),

            travelStartingDate: Joi.date().required().messages({
                "any.required": "Travel starting date is required",
                "date.base": "Invalid travel starting date format",
            }),

            groupSize: Joi.number().integer().positive().required().messages({
                "any.required": "Group size is required",
                "number.base": "Group size must be a number",
                "number.positive": "Group size must be a positive number",
            }),

            nationality: Joi.string().required().messages({
                "any.required": "Nationality is required",
            }),

            totalPrice: Joi.string().required().messages({
                "any.required": "Total price is required",
                "string.base": "Total price must be a string",
            }),
        });

        const validatedInput = validateInput(visaDetailsSchema, rawData);
        const { visaId, ...rest } = validatedInput;

        const documentFiles = files || [];
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
            ...rest,
            visaId,
            documents: documentPaths,
        });

        return data;
    },

    deleteVisaRequest: async ({ id }: { id: string }) => {
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

    updateVisaRequest: async (
        inputData: Prisma.VisaRequestUpdateInput & { visaId: string; id: string }
    ) => {
        const { id, ...updateFields } = inputData;

        if (Object.keys(updateFields).length === 0) {
            throw new ConstraintError(
                "Invalid request body",
                400,
                "INVALID_REQUEST_BODY",
                "Request body must contain at least one update field"
            );
        }

        const updateSchema = Joi.object({
            travelStartingDate: Joi.date().optional().messages({
                "date.base": "Travel starting date must be a valid date",
            }),

            status: Joi.string()
                .valid("Pending", "Processing", "Done", "Cancelled")
                .optional()
                .messages({
                    "any.only": "Status must be one of: Pending, Processing, Done, Cancelled",
                }),

            nationality: Joi.string().optional(),

            notes: Joi.string().optional(),
        }).min(1);

        const validatedFields = validateInput(updateSchema, updateFields);

        const visaRequestExists = await visaBookingRepo.exists({ id });
        if (!visaRequestExists) {
            throw new ConstraintError(
                "Visa request not found",
                404,
                "RESOURCE_NOT_FOUND",
                `Visa request with ID ${id} does not exist`
            );
        }

        if (validatedFields.status === "Processing") {
            validatedFields.startedAt = new Date();
        }

        if (["Done", "Cancelled"].includes(validatedFields.status || "")) {
            validatedFields.confirmedAt = new Date();
        }

        const updated = await visaBookingRepo.update({ id, ...validatedFields });
        return updated;
    },
};
