import { Prisma } from "@prisma/client";
import { ConstraintError } from "../base/constraint-error";
import { visaRepo } from "@/core/infrastructure/repositories/visa.repo";
import { visaBookingRepo } from "@/core/infrastructure/repositories/visa-booking.repo";
import { passengerRepo } from "@/core/infrastructure/repositories/passenger.repo";
import Joi from "joi";
import { validateInput } from "@/utils/validate-input";
import { prisma } from "@/config";

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
                visaRequestId: data.visaRequest.id,
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
    requestVisa: async (inputData: Prisma.VisaRequestCreateInput & { visaId: string }) => {
        const visaDetailsSchema = Joi.object({
            visaId: Joi.string().uuid().required().messages({
                "any.required": "Visa ID is a required field",
                "string.uuid": "Visa ID must be a valid UUID",
            }),
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

        const validatedInput = validateInput(visaDetailsSchema, inputData);
        const { visaId, ...rest } = validatedInput;

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

    updateVisaRequest: async (inputData: {
        basicInfos: {
            visaRequestId: string;
            id?: string;
            country?: string;
            travelStartingDate?: string | Date;
            groupSize?: number;
            status?: string;
            nationality?: string;
            totalPrice?: number;
            agencyName?: string;
            agentName?: string;
            name?: string;
            notes?: string | null;
        };

        passengers?: ({
            passengerDocuments?: ({
                passengerDocumentsFiles?: {
                    id?: string;
                    deletedAt?: Date;
                    name?: string;
                    filePath?: string;
                    fileType?: string;
                    uploadedAt?: Date;
                };
            } & {
                id?: string;
                createdAt?: Date;
                passengerId?: string;
                documentId?: string;
                label?: string | null;
                isMendatory?: boolean | null;
            })[];
        } & {
            id?: string;
            notes?: string | null;
            createdAt?: Date;
            updatedAt?: Date;
            deletedAt?: Date | null;
            visaRequestId?: string;
            name?: string;
            surname?: string;
            placeOfBirth?: string;
            dateOfBirth?: Date;
            passportNumber?: string;
            passportDeliveryDate?: Date;
            passportExpirationDate?: Date;
            email?: string;
            phone?: string;
        })[];

        id: string;
    }) => {
        // Updated validation schemas with optional fields
        const passengerDocumentFileSchema = Joi.object({
            id: Joi.string().optional(),
            deletedAt: Joi.date().optional(),
            name: Joi.string().optional(),
            filePath: Joi.string().optional(),
            fileType: Joi.string().optional(),
            uploadedAt: Joi.date().optional(),
        });

        const passengerDocumentSchema = Joi.object({
            id: Joi.string().optional(),
            createdAt: Joi.date().optional(),
            passengerId: Joi.string().optional(),
            documentId: Joi.string().optional(),
            label: Joi.string().allow(null).optional(),
            isMendatory: Joi.boolean().allow(null).optional(),
            passengerDocumentsFiles: passengerDocumentFileSchema.optional(),
        });

        const passengerSchema = Joi.object({
            id: Joi.string().required(), // ID required for updates
            notes: Joi.string().allow(null).optional(),
            createdAt: Joi.date().optional(),
            updatedAt: Joi.date().optional(),
            deletedAt: Joi.date().allow(null).optional(),
            visaRequestId: Joi.string().optional(),
            name: Joi.string().optional(),
            surname: Joi.string().optional(),
            placeOfBirth: Joi.string().optional(),
            dateOfBirth: Joi.date().optional(),
            passportNumber: Joi.string().optional(),
            passportDeliveryDate: Joi.date().optional(),
            passportExpirationDate: Joi.date().optional(),
            email: Joi.string().email().optional(),
            phone: Joi.string().optional(),
            passengerDocuments: Joi.array().items(passengerDocumentSchema).optional(),
        });

        const basicInfosSchema = Joi.object({
            visaRequestId: Joi.string().required(), // Required for update
            id: Joi.string().optional(),
            travelStartingDate: Joi.alternatives()
                .try(Joi.string(), Joi.date())
                .optional()
                .messages({
                    "date.base": "Travel starting date must be a valid date",
                }),
            groupSize: Joi.number().optional(),
            status: Joi.string()
                .valid("Pending", "Processing", "Done", "Cancelled")
                .optional()
                .messages({
                    "any.only": "Status must be one of: Pending, Processing, Done, Cancelled",
                }),
            nationality: Joi.string().optional(),
            totalPrice: Joi.string().optional(),
            agencyName: Joi.string().optional(),
            agentName: Joi.string().optional(),
            name: Joi.string().optional(),
            notes: Joi.string().allow(null).optional(),
        });

        const updateVisaRequestSchema = Joi.object({
            id: Joi.string().required(),
            basicInfos: basicInfosSchema.required(),
            passengers: Joi.array().items(passengerSchema).optional(),
        });

        const validatedInput = validateInput(updateVisaRequestSchema, inputData);
        const {
            id: pivotId,
            basicInfos: { visaRequestId, ...visaRequestData },
            passengers,
        } = validatedInput;

        // Prepare update data with only provided fields
        const updateData: Prisma.VisaRequestUpdateInput = {};

        if (visaRequestData.travelStartingDate !== undefined) {
            updateData.travelStartingDate = new Date(visaRequestData.travelStartingDate);
        }
        if (visaRequestData.groupSize !== undefined)
            updateData.groupSize = visaRequestData.groupSize;
        if (visaRequestData.status !== undefined) updateData.status = visaRequestData.status;
        if (visaRequestData.nationality !== undefined)
            updateData.nationality = visaRequestData.nationality;
        if (visaRequestData.totalPrice !== undefined)
            updateData.totalPrice = String(visaRequestData.totalPrice);
        if (visaRequestData.agencyName !== undefined)
            updateData.agencyName = visaRequestData.agencyName;
        if (visaRequestData.agentName !== undefined)
            updateData.agentName = visaRequestData.agentName;
        if (visaRequestData.notes !== undefined) updateData.notes = visaRequestData.notes;

        await prisma.$transaction(async (tx) => {
            // Update VisaRequest if any fields provided
            if (Object.keys(updateData).length > 0) {
                await tx.visaRequest.update({
                    where: { id: visaRequestId },
                    data: updateData,
                });
            }

            // Update passengers if provided
            if (passengers && passengers.length > 0) {
                for (const passenger of passengers) {
                    const passengerUpdateData: Prisma.PassengerUpdateInput = {};

                    if (passenger.name !== undefined) passengerUpdateData.name = passenger.name;
                    if (passenger.surname !== undefined)
                        passengerUpdateData.surname = passenger.surname;
                    if (passenger.placeOfBirth !== undefined)
                        passengerUpdateData.placeOfBirth = passenger.placeOfBirth;
                    if (passenger.dateOfBirth !== undefined)
                        passengerUpdateData.dateOfBirth = new Date(passenger.dateOfBirth);
                    if (passenger.passportNumber !== undefined)
                        passengerUpdateData.passportNumber = passenger.passportNumber;
                    if (passenger.passportDeliveryDate !== undefined)
                        passengerUpdateData.passportDeliveryDate = new Date(
                            passenger.passportDeliveryDate
                        );
                    if (passenger.passportExpirationDate !== undefined)
                        passengerUpdateData.passportExpirationDate = new Date(
                            passenger.passportExpirationDate
                        );
                    if (passenger.email !== undefined) passengerUpdateData.email = passenger.email;
                    if (passenger.phone !== undefined) passengerUpdateData.phone = passenger.phone;
                    if (passenger.notes !== undefined) passengerUpdateData.notes = passenger.notes;

                    // Only update if there are fields to update
                    if (Object.keys(passengerUpdateData).length > 0) {
                        await tx.passenger.update({
                            where: { id: passenger.id },
                            data: passengerUpdateData,
                        });
                    }

                    // Update documents if provided
                    if (passenger.passengerDocuments && passenger.passengerDocuments.length > 0) {
                        for (const document of passenger.passengerDocuments) {
                            const documentUpdateData: Prisma.PassengerDocumentsUpdateInput = {};

                            if (document.label !== undefined)
                                documentUpdateData.label = document.label;
                            if (document.isMendatory !== undefined)
                                documentUpdateData.isMendatory = document.isMendatory;

                            // Only update if there are fields to update
                            if (Object.keys(documentUpdateData).length > 0) {
                                await tx.passengerDocuments.update({
                                    where: { id: document.id },
                                    data: documentUpdateData,
                                });
                            }
                        }
                    }
                }
            }
        });

        // Return updated booking
        return VisaBookingService.getVisaBookingById({ id: pivotId });
    },
};
