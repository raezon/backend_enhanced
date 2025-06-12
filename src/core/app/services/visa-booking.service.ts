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
        passenger: { id: string; documentId: string };
        // basicInfos: {
        //     visaRequestId: string;
        //     id?: string;
        //     country?: string;
        //     travelStartingDate?: string | Date;
        //     groupSize?: number;
        //     status?: string;
        //     nationality?: string;
        //     totalPrice?: number;
        //     agencyName?: string;
        //     agentName?: string;
        //     name?: string;
        //     notes?: string | null;
        // };
        // passengers?: {
        //     id: string;
        //     notes?: string | null;
        //     name?: string;
        //     surname?: string;
        //     placeOfBirth?: string;
        //     dateOfBirth?: Date;
        //     passportNumber?: string;
        //     passportDeliveryDate?: Date;
        //     passportExpirationDate?: Date;
        //     email?: string;
        //     phone?: string;
        //     passengerDocuments?: {
        //         id?: string;
        //         label?: string | null;
        //         isMendatory?: boolean | null;
        //         fileId?: string; // For matching uploaded files
        //         deleted?: boolean; // For deletion flag
        //         existingFileId?: string; // For existing file reference
        //     }[];
        // }[];
        files: Express.Multer.File[];
    }) => {
        const { id, files, passenger } = inputData;

        const schema = Joi.object({
            id: Joi.string().uuid().required().messages({
                "any.required": "ID is a required field",
                "string.uuid": "ID must be a valid UUID",
            }),
            passengerId: Joi.object({
                id: Joi.string().uuid().required().messages({
                    "any.required": "Passenger ID is a required field",
                    "string.uuid": "Passenger ID must be a valid UUID",
                }),
                documentId: Joi.string().uuid().required().messages({
                    "any.required": "document ID is a required field",
                    "string.uuid": "document ID must be a valid UUID",
                }),
            }),
        });

        const validatedInput = validateInput(schema, { id, passenger });
        const {
            id: validatedId,
            passenger: { id: validatedPassengerId, documentId: validatedDocumentId },
        } = validatedInput;
        const passengerExists = await passengerRepo.exists(validatedPassengerId);

        if (!passengerExists) {
            throw new ConstraintError(
                "Passenger not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Passenger could not be found`
            );
        }

        const pivot = await visaBookingRepo.findOnePivot({ id: validatedId });

        if (!pivot) {
            throw new ConstraintError(
                "Visa Request pivot not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Visa Request pivot could not be found`
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const savedDocs = await tx.passengerDocuments.findMany({
                where: {
                    passengerId: validatedPassengerId,
                    documentId: validatedDocumentId,
                },

                include: {
                    passengerDocumentsFiles: true,
                },
            });
            const savedDocFiles = savedDocs.map((t) => t.passengerDocumentsFiles);
            const savedFileNames = savedDocFiles.map((f) => f.filePath);
            const uploadedFileNames = files.map((f) => f.originalname);

            // Added files: in upload but not in DB
            const addedFiles = files.filter((f) => !savedFileNames.includes(f.filename));

            // Deleted files: in DB but not in upload
            const deletedFiles = savedDocFiles.filter((f) => !uploadedFileNames.includes(f.filePath));

            for (const file of addedFiles) {
                const savedFile = await tx.passengerDocumentsFiles.create({
                    data: {
                        filePath: file.filename, // stored filename only
                        fileType: file.mimetype,
                        name: file.originalname,
                    },
                });
                await tx.passengerDocuments.create({
                    data: {
                        passengerId: passenger.id,
                        documentId: savedFile.id,
                    },
                });
            }

            for (const file of deletedFiles) {
                await tx.passengerDocuments.delete({
                    where: {
                        passengerId_documentId: {
                            passengerId: validatedPassengerId,
                            documentId: validatedDocumentId,
                        },

                        passengerDocumentsFiles: {
                            id: file.id,
                        },
                    },
                });
            }
        });
        return result;
    },
};
