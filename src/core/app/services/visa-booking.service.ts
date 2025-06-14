import { Prisma } from "@prisma/client";
import { ConstraintError } from "../base/constraint-error";
import { visaRepo } from "@/core/infrastructure/repositories/visa.repo";
import { visaBookingRepo } from "@/core/infrastructure/repositories/visa-booking.repo";
import { passengerRepo } from "@/core/infrastructure/repositories/passenger.repo";
import Joi from "joi";
import { validateInput } from "@/utils/validate-input";
import { prisma } from "@/config";
import printf from "@/scripts/printf";

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
        pivotId: string;
        basicInfos: {
            travelStartingDate: string;
            status: string;
            nationality: string;
            notes: string;
            id: string;
        };
        passenger: {
            id: string;
            name: string;
            surname: string;
            placeOfBirth: string;
            dateOfBirth: string;
            email: string;
            phone: string;
            passportNumber: string;
            passportDeliveryDate: string;
            passportExpirationDate: string;
        };

        deletedFiles: { id: string }[];
        files: Express.Multer.File[];
    }) => {
        const updateVisaRequestSchema = Joi.object({
            pivotId: Joi.string().uuid().optional().messages({
                "string.uuid": "pivotId must be a valid UUID.",
            }),

            basicInfos: Joi.object({
                travelStartingDate: Joi.string().isoDate().optional().messages({
                    "string.isoDate": "Travel starting date must be a valid ISO date.",
                }),
                status: Joi.string().optional(),
                nationality: Joi.string().optional(),
                notes: Joi.string().allow("").optional(),
                id: Joi.string().uuid().optional().messages({
                    "string.uuid": "pivotId must be a valid UUID.",
                }),
            }).optional(),

            passenger: Joi.object({
                id: Joi.string().uuid().optional().messages({
                    "string.uuid": "Passenger id must be a valid UUID.",
                }),
                name: Joi.string().optional(),
                surname: Joi.string().optional(),
                placeOfBirth: Joi.string().optional(),
                dateOfBirth: Joi.string().isoDate().optional().messages({
                    "string.isoDate": "Date of birth must be a valid ISO date.",
                }),
                email: Joi.string().email().optional(),
                phone: Joi.string().optional(),
                passportNumber: Joi.string().optional(),
                passportDeliveryDate: Joi.string().isoDate().optional().messages({
                    "string.isoDate": "Passport delivery date must be a valid ISO date.",
                }),
                passportExpirationDate: Joi.string().isoDate().optional().messages({
                    "string.isoDate": "Passport expiration date must be a valid ISO date.",
                }),
            }).optional(),

            deletedFiles: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.string().uuid().required().messages({
                            "string.uuid": "File id must be a valid UUID.",
                        }),
                    })
                )
                .optional(),

            files: Joi.any().optional(), // still handled by multer middleware
        });

        const {
            basicInfos: { id: visaRequestId, ...rest },
            deletedFiles,
            files,
            passenger,
        } = validateInput<typeof inputData>(updateVisaRequestSchema, inputData);

        await prisma.$transaction(async (tx) => {
            const visaRequest = await tx.visaRequest.update({
                where: {
                    id: visaRequestId,
                },
                data: rest,
            });

            if (deletedFiles.length > 0) {
                for (const file of deletedFiles) {
                    await tx.passengerDocuments.delete({
                        where: {
                            passengerId_documentId: {
                                documentId: file.id,
                                passengerId: passenger.id,
                            },
                        },
                    });
                }
            }

            if (files.length > 0) {
                for (const file of files) {
                    const savedFile = await tx.passengerDocumentsFiles.create({
                        data: {
                            filePath: file.filename, // stored filename only
                            fileType: file.mimetype,
                            name: file.originalname,
                        },
                    });
                    const doc = await tx.passengerDocuments.create({
                        data: {
                            passengerId: passenger.id,
                            documentId: savedFile.id,
                        },
                    });
                }
            }
        });
    },
};
