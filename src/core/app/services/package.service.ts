import Joi from "joi";
import { PackageType } from "@prisma/client";
import { validateInput } from "@/utils/validate-input";
import { prisma } from "@/config";

export const PackageService = {
    createSlotAvailability: async (inputData: {
        packageId: string;
        slots: {
            start: Date;
            finish: Date;
            days: number;
            nights: number;
            initialPlace: number;
        }[];
    }) => {
        const createSchema = Joi.object({
            packageId: Joi.string().uuid({ version: "uuidv4" }).required().label("Package ID"),

            slots: Joi.array()
                .items(
                    Joi.object({
                        start: Joi.date().required().label("Start date"),
                        finish: Joi.date()
                            .greater(Joi.ref("start"))
                            .required()
                            .label("Finish date"),
                        days: Joi.number().integer().min(1).required().label("Days"),
                        nights: Joi.number().integer().min(0).required().label("Nights"),
                        initialPlace: Joi.number()
                            .integer()
                            .min(0)
                            .required()
                            .label("Initial place"),
                    })
                )
                .min(1)
                .required()
                .label("Slot availability list"),
        });

        const validatedData = validateInput<typeof inputData>(createSchema, inputData);

        const result = await prisma.departureSlot.createMany({
            data: validatedData.slots.map((slot) => ({
                ...slot,
                packageId: validatedData.packageId,
            })),
        });

        return result;
    },

    addImages: async (inputData: { files: Express.Multer.File[]; packageId: string }) => {
        const schema = Joi.object({
            files: Joi.array()
                .items(
                    Joi.object({
                        originalname: Joi.string().required(),
                        buffer: Joi.binary().required(),
                    })
                )
                .min(1)
                .required(),
            packageId: Joi.string().uuid().required(),
        });

        const { files, packageId } = validateInput<{
            files: Express.Multer.File[];
            packageId: string;
        }>(schema, inputData);

        const data = await prisma.packageImage.createMany({
            data: files.map((file) => ({
                packageId,
                fileName: file.originalname,
                url: file.filename,
            })),
        });

        return data;
    },

    createNewPackage: async (inputData: {
        userId: string;
        basic: {
            isPublic: boolean;
            combination_active: boolean;
            isRecommended: boolean;
            name: string;
            displayName: string;
            option: number;
            priority: number;
            departureCity: string;
            type: PackageType;
            shortDescription: string;
            description?: string;
            importantNotes?: string;
            empContract?: string;
            inclusion?: string;
            min_age_first_child?: number;
            max_age_first_child?: number;
            min_age_second_child?: number;
            max_age_second_child?: number;
        };
        departures: { name: string }[];
        destinations: { name: string }[];
        pricePerPerson: {
            markupPlatform: number;
            markupAgency: number;
            prices: {
                name: string;
                adultPrice: number;
                childPrice6To11: number;
                childPrice2To5: number;
                infantPrice: number;
            }[];
        };
    }) => {
        const schema = Joi.object({
            userId: Joi.string().uuid().required(),
            basic: Joi.object({
                isPublic: Joi.boolean().required(),
                combination_active: Joi.boolean().required(),
                isRecommended: Joi.boolean().required(),
                name: Joi.string().required(),
                displayName: Joi.string().required(),
                option: Joi.number().integer().required(),
                priority: Joi.number().integer().required(),
                departureCity: Joi.string().required(),
                type: Joi.string().valid("VACATION", "OMRA", "HADJ").required(),
                shortDescription: Joi.string().required(),
                description: Joi.string().optional().allow(null, ""),
                importantNotes: Joi.string().optional().allow(null, ""),
                empContract: Joi.string().optional().allow(null, ""),
                inclusion: Joi.string().optional().allow(null, ""),
                min_age_first_child: Joi.number().integer().min(0).optional(),
                max_age_first_child: Joi.number().integer().min(0).optional(),
                min_age_second_child: Joi.number().integer().min(0).optional(),
                max_age_second_child: Joi.number().integer().min(0).optional(),
            }).required(),

            departures: Joi.array()
                .items(Joi.object({ name: Joi.string().required() }))
                .min(1)
                .required(),

            destinations: Joi.array()
                .items(Joi.object({ name: Joi.string().required() }))
                .min(1)
                .required(),

            pricePerPerson: Joi.object({
                markupPlatform: Joi.number().min(0).required(),
                markupAgency: Joi.number().min(0).required(),
                prices: Joi.array()
                    .items(
                        Joi.object({
                            name: Joi.string().required(),
                            adultPrice: Joi.number().min(0).required(),
                            childPrice6To11: Joi.number().min(0).required(),
                            childPrice2To5: Joi.number().min(0).required(),
                            infantPrice: Joi.number().min(0).required(),
                        })
                    )
                    .min(1)
                    .required(),
            }).required(),
        });

        const { basic, departures, destinations, pricePerPerson, userId } = validateInput<{
            userId: string;
            basic: {
                isPublic: boolean;
                combination_active: boolean;
                isRecommended: boolean;
                name: string;
                displayName: string;
                option: number;
                priority: number;
                departureCity: string;
                type: PackageType;
                shortDescription: string;
                description?: string;
                importantNotes?: string;
                empContract?: string;
                inclusion?: string;
                min_age_first_child?: number;
                max_age_first_child?: number;
                min_age_second_child?: number;
                max_age_second_child?: number;
            };
            departures: { name: string }[];
            destinations: { name: string }[];
            pricePerPerson: {
                markupPlatform: number;
                markupAgency: number;
                prices: {
                    name: string;
                    adultPrice: number;
                    childPrice6To11: number;
                    childPrice2To5: number;
                    infantPrice: number;
                }[];
            };
        }>(schema, inputData);

        const data = prisma.$transaction(async (tx) => {
            const createdPackage = await tx.package.create({
                data: {
                    ...basic,
                    userId,
                },
            });

            await tx.departure.createMany({
                data: departures.map((departure) => ({
                    name: departure.name,
                    packageId: createdPackage.id,
                })),
            });

            await tx.destination.createMany({
                data: destinations.map((destination) => ({
                    name: destination.name,
                    packageId: createdPackage.id,
                })),
            });

            const { prices, ...rest } = pricePerPerson;
            const createdPricePerPerson = await tx.pricePerPerson.create({
                data: {
                    ...rest,
                    packageId: createdPackage.id,
                },
            });

            await tx.price.createMany({
                data: prices.map((price) => ({
                    ...price,
                    pricePerPersonId: createdPricePerPerson.id,
                })),
            });

            return createdPackage;
        });

        return data;
    },
};
