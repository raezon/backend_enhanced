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
            id: string;
            country: string;
            travelStartingDate: string | Date;
            groupSize: number;
            status: string;
            nationality: string;
            totalPrice: number;
            agencyName: string;
            agentName: string;
            name: string;
            notes: string | null;
        };

        passengers: ({
            passengerDocuments: ({
                passengerDocumentsFiles: {
                    id: string;
                    deletedAt: Date;
                    name: string;
                    filePath: string;
                    fileType: string;
                    uploadedAt: Date;
                };
            } & {
                id: string;
                createdAt: Date;
                passengerId: string;
                documentId: string;
                label: string | null;
                isMendatory: boolean | null;
            })[];
        } & {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            visaRequestId: string;
            name: string;
            surname: string;
            placeOfBirth: string;
            dateOfBirth: Date;
            passportNumber: string;
            passportDeliveryDate: Date;
            passportExpirationDate: Date;
            email: string;
            phone: string;
        })[];

        id: string;
    }) => {
        const passengerDocumentFileSchema = Joi.object({
            id: Joi.string().required(),
            deletedAt: Joi.date().required(),
            name: Joi.string().required(),
            filePath: Joi.string().required(),
            fileType: Joi.string().required(),
            uploadedAt: Joi.date().required(),
        });

        const passengerDocumentSchema = Joi.object({
            id: Joi.string().required(),
            createdAt: Joi.date().required(),
            passengerId: Joi.string().required(),
            documentId: Joi.string().required(),
            label: Joi.string().allow(null),
            isMendatory: Joi.boolean().allow(null),
            passengerDocumentsFiles: passengerDocumentFileSchema.required(),
        });

        const passengerSchema = Joi.object({
            id: Joi.string().required(),
            notes: Joi.string().allow(null),
            createdAt: Joi.date().required(),
            updatedAt: Joi.date().required(),
            deletedAt: Joi.date().allow(null),
            visaRequestId: Joi.string().required(),
            name: Joi.string().required(),
            surname: Joi.string().required(),
            placeOfBirth: Joi.string().required(),
            dateOfBirth: Joi.date().required(),
            passportNumber: Joi.string().required(),
            passportDeliveryDate: Joi.date().required(),
            passportExpirationDate: Joi.date().required(),
            email: Joi.string().email().required(),
            phone: Joi.string().required(),
            passengerDocuments: Joi.array().items(passengerDocumentSchema).required(),
        });

        const basicInfosSchema = Joi.object({
            visaRequestId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
            id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
            country: Joi.string().required(),
            travelStartingDate: Joi.alternatives()
                .try(Joi.string(), Joi.date())
                .required()
                .messages({
                    "date.base": "Travel starting date must be a valid date",
                }),
            groupSize: Joi.number().required(),
            status: Joi.string()
                .valid("Pending", "Processing", "Done", "Cancelled")
                .required()
                .messages({
                    "any.only": "Status must be one of: Pending, Processing, Done, Cancelled",
                }),
            nationality: Joi.string().required(),
            totalPrice: Joi.number().required(),
            agencyName: Joi.string().required(),
            agentName: Joi.string().required(),
            name: Joi.string().required(),
            notes: Joi.string().allow(null),
        });

        const updateVisaRequestSchema = Joi.object({
            id: Joi.string().required(),
            basicInfos: basicInfosSchema.required(),
            passengers: Joi.array().items(passengerSchema).required(),
        });

        const validatedInput = validateInput<{
            id: string;
            basicInfos: {
                visaRequestId: string;
                id: string;
                country: string;
                travelStartingDate: string | Date;
                groupSize: number;
                status: string;
                nationality: string;
                totalPrice: number;
                agencyName: string;
                agentName: string;
                name: string;
                notes: string | null;
            };
            passengers: ({
                passengerDocuments: ({
                    passengerDocumentsFiles: {
                        id: string;
                        deletedAt: Date;
                        name: string;
                        filePath: string;
                        fileType: string;
                        uploadedAt: Date;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    passengerId: string;
                    documentId: string;
                    label: string | null;
                    isMendatory: boolean | null;
                })[];
            } & {
                id: string;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                visaRequestId: string;
                name: string;
                surname: string;
                placeOfBirth: string;
                dateOfBirth: Date;
                passportNumber: string;
                passportDeliveryDate: Date;
                passportExpirationDate: Date;
                email: string;
                phone: string;
            })[];
        }>(updateVisaRequestSchema, inputData);

        const {
            id: pivotId,
            basicInfos: { visaRequestId, ...visaRequestData },
            passengers,
        } = validatedInput;

        // Convert dates and prices
        const updateData = {
            ...visaRequestData,
            travelStartingDate: new Date(visaRequestData.travelStartingDate),
            totalPrice: String(visaRequestData.totalPrice),
        };

        await prisma.$transaction(async (tx) => {
            // 1. Update VisaRequest
            await tx.visaRequest.update({
                where: { id: visaRequestId },
                data: updateData,
            });

            // 2. Update Passengers
            for (const passenger of passengers) {
                // Update passenger fields
                await tx.passenger.update({
                    where: { id: passenger.id },
                    data: {
                        name: passenger.name,
                        surname: passenger.surname,
                        placeOfBirth: passenger.placeOfBirth,
                        dateOfBirth: new Date(passenger.dateOfBirth),
                        passportNumber: passenger.passportNumber,
                        passportDeliveryDate: new Date(passenger.passportDeliveryDate),
                        passportExpirationDate: new Date(passenger.passportExpirationDate),
                        email: passenger.email,
                        phone: passenger.phone,
                        notes: passenger.notes,
                    },
                });

                // 3. Update Passenger Documents (if needed)
                for (const document of passenger.passengerDocuments) {
                    await tx.passengerDocuments.update({
                        where: { id: document.id },
                        data: {
                            label: document.label,
                            isMendatory: document.isMendatory,
                        },
                    });
                }
            }
        });

        // Return updated booking
        return VisaBookingService.getVisaBookingById({ id: pivotId });
    },
};
