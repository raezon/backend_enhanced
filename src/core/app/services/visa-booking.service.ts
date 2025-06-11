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
        id: string;
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
        passengers?: {
            id: string;
            notes?: string | null;
            name?: string;
            surname?: string;
            placeOfBirth?: string;
            dateOfBirth?: Date;
            passportNumber?: string;
            passportDeliveryDate?: Date;
            passportExpirationDate?: Date;
            email?: string;
            phone?: string;
            passengerDocuments?: {
                id?: string;
                label?: string | null;
                isMendatory?: boolean | null;
                fileId?: string; // For matching uploaded files
                deleted?: boolean; // For deletion flag
                existingFileId?: string; // For existing file reference
            }[];
        }[];
        files: Express.Multer.File[];
    }) => {
        // Updated validation schemas
        const passengerDocumentSchema = Joi.object({
            id: Joi.string().optional(),
            label: Joi.string().allow(null).optional(),
            isMendatory: Joi.boolean().allow(null).optional(),
            fileId: Joi.string().optional(), // For new/replacement files
            deleted: Joi.boolean().optional(), // For deletion flag
            existingFileId: Joi.string().optional(), // For existing files
        });

        const passengerSchema = Joi.object({
            id: Joi.string().required(),
            notes: Joi.string().allow(null).optional(),
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
            visaRequestId: Joi.string().required(),
            id: Joi.string().optional(),
            travelStartingDate: Joi.alternatives().try(Joi.string(), Joi.date()).optional(),
            groupSize: Joi.number().optional(),
            status: Joi.string().valid("Pending", "Processing", "Done", "Cancelled").optional(),
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
            files: Joi.array().items(Joi.object()).optional(),
        });

        const validatedInput = validateInput(updateVisaRequestSchema, inputData);
        const {
            id: pivotId,
            basicInfos: { visaRequestId, ...visaRequestData },
            passengers,
            files = [],
        } = validatedInput;

        // Create file map by fieldname (fileId)
        const fileMap = new Map<string, Express.Multer.File>();
        files.forEach((file) => {
            fileMap.set(file.fieldname, file);
        });

        // Prepare update data
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

        const updatedVisaRequest = await prisma.$transaction(async (tx) => {
            // Update VisaRequest
            if (Object.keys(updateData).length > 0) {
                await tx.visaRequest.update({
                    where: { id: visaRequestId },
                    data: updateData,
                });
            }

            // Process passengers
            if (passengers && passengers.length > 0) {
                for (const passenger of passengers) {
                    // Update passenger details
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

                    if (Object.keys(passengerUpdateData).length > 0) {
                        await tx.passenger.update({
                            where: { id: passenger.id },
                            data: passengerUpdateData,
                        });
                    }

                    // Process documents
                    if (passenger.passengerDocuments) {
                        for (const document of passenger.passengerDocuments) {
                            // Document deletion
                            if (document.deleted) {
                                if (document.id) {
                                    // Delete document association
                                    await tx.passengerDocuments.delete({
                                        where: { id: document.id },
                                    });
                                }

                                if (document.existingFileId) {
                                    // Soft-delete file
                                    await tx.passengerDocumentsFiles.update({
                                        where: { id: document.existingFileId },
                                        data: { deletedAt: new Date() },
                                    });
                                }
                                continue;
                            }

                            // Existing document update
                            if (document.id) {
                                const docUpdateData: Prisma.PassengerDocumentsUpdateInput = {};

                                if (document.label !== undefined)
                                    docUpdateData.label = document.label;
                                if (document.isMendatory !== undefined)
                                    docUpdateData.isMendatory = document.isMendatory;

                                // File replacement
                                if (document.fileId) {
                                    const file = fileMap.get(document.fileId);
                                    if (!file) {
                                        throw new Error(
                                            `File not found for fileId: ${document.fileId}`
                                        );
                                    }

                                    // Create new file record
                                    const newFile = await tx.passengerDocumentsFiles.create({
                                        data: {
                                            filePath: file.path, // Adjust based on storage
                                            fileType: file.mimetype,
                                            name: file.originalname,
                                            uploadedAt: new Date(),
                                        },
                                    });

                                    // Update document to point to new file
                                    docUpdateData.id = newFile.id;

                                    // Soft-delete previous file if exists
                                    if (document.existingFileId) {
                                        await tx.passengerDocumentsFiles.update({
                                            where: { id: document.existingFileId },
                                            data: { deletedAt: new Date() },
                                        });
                                    }
                                }

                                // Update document metadata
                                if (Object.keys(docUpdateData).length > 0) {
                                    await tx.passengerDocuments.update({
                                        where: { id: document.id },
                                        data: docUpdateData,
                                    });
                                }
                            }
                            // New document creation
                            else if (document.fileId) {
                                const file = fileMap.get(document.fileId);
                                if (!file) {
                                    throw new Error(
                                        `File not found for fileId: ${document.fileId}`
                                    );
                                }

                                // Create new file record
                                const newFile = await tx.passengerDocumentsFiles.create({
                                    data: {
                                        filePath: file.path, // Adjust based on storage
                                        fileType: file.mimetype,
                                        name: file.originalname,
                                        uploadedAt: new Date(),
                                    },
                                });

                                // Create new document association
                                await tx.passengerDocuments.create({
                                    data: {
                                        passengerId: passenger.id,
                                        label: document.label || "Document",
                                        isMendatory: document.isMendatory ?? true,
                                        documentId: newFile.id,
                                    },
                                });
                            }
                        }
                    }
                }
            }

            return tx.visaRequest.findUnique({
                where: { id: visaRequestId },
                include: {
                    passengers: {
                        include: {
                            passengerDocuments: {
                                include: {
                                    passengerDocumentsFiles: true,
                                },
                            },
                        },
                    },
                },
            });
        });

        return {
            ...updatedVisaRequest,
            pivotId,
        };
    },
};
