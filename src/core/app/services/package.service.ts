import Joi from "joi";
import {
    ConditionAnnulationType,
    PackagePensionType,
    PackageStepType,
    PackageType,
} from "@prisma/client";
import { validateInput } from "@/utils/validate-input";
import { Env, prisma } from "@/config";
import { ConstraintError } from "../base/constraint-error";

export const PackageService = {
    createConditions: async (inputData: {
        packageId: string;
        conditions: {
            de: Date;
            arrival: Date;
            nights?: number;
            percentage?: number;
            fixedPrice?: number;
            type?: ConditionAnnulationType;
        }[];
    }) => {
        const stepSchema = Joi.object({
            de: Joi.date().iso().required().messages({
                "date.base": '"de" must be a valid date',
                "any.required": '"de" is required',
            }),
            arrival: Joi.date().iso().required().messages({
                "date.base": '"arrival" must be a valid date',
                "any.required": '"arrival" is required',
            }),
            nights: Joi.number().integer().min(1).optional().messages({
                "number.base": '"nights" must be a number',
                "number.integer": '"nights" must be an integer',
                "number.min": '"nights" must be at least 1',
                "any.required": '"nights" is required',
            }),
            percentage: Joi.number().min(0).max(100).optional(),
            fixedPrice: Joi.number().min(0).optional(),
            type: Joi.string().valid("PERCENTAGE", "FIXED_PRICE").optional().messages({
                "any.only": '"type" must be a valid condition type',
                "any.required": '"type" is required',
            }),
        });

        const schema = Joi.object({
            packageId: Joi.string().uuid().required().messages({
                "string.guid": '"packageId" must be a valid UUID',
                "any.required": '"packageId" is required',
            }),
            conditions: Joi.array().items(stepSchema).min(1).required().messages({
                "array.base": '"steps" must be an array',
                "array.min": '"steps" must contain at least one step',
                "any.required": '"steps" is required',
            }),
        });
        const { packageId, conditions } = validateInput<typeof inputData>(schema, inputData);

        const packageExists = await prisma.package.count({
            where: { id: packageId },
        });
        if (packageExists === 0) {
            throw new ConstraintError(
                "Package does not exist",
                404,
                "NOT_FOUND",
                "package does not exist in the database"
            );
        }

        const data = await prisma.conditionAnnulation.createMany({
            data: conditions.map((step) => ({
                packageId,
                de: step.de,
                arrival: step.arrival,
                nights: step.nights ?? null,
                percentage: step.percentage ?? null,
                fixedPrice: step.fixedPrice ?? null,
                type: step.type,
            })),
        });

        return data;
    },

    createPackageStep: async (inputData: {
        packageId: string;
        steps: {
            type: PackageStepType;
            hotelName: string;
            nights: number;
            rate: number;
            description: string;
            address: string;
            primaryImage: Express.Multer.File;
            secondaryImages: Express.Multer.File[];
        }[];
    }) => {
        const stepSchema = Joi.object({
            type: Joi.string().valid("FLIGHT", "HOTEL", "ACTIVITY").required().messages({
                "any.required": '"type" is required',
                "any.only": '"type" must be a valid step type',
            }),

            hotelName: Joi.string().required().messages({
                "string.base": '"hotelName" must be a string',
                "any.required": '"hotelName" is required',
            }),

            nights: Joi.number().integer().min(1).required().messages({
                "number.base": '"nights" must be a number',
                "number.integer": '"nights" must be an integer',
                "number.min": '"nights" must be at least 1',
                "any.required": '"nights" is required',
            }),

            rate: Joi.number().integer().min(1).max(5).required().messages({
                "number.base": '"rate" must be a number',
                "number.min": '"rate" must be between 1 and 5',
                "number.max": '"rate" must be between 1 and 5',
                "any.required": '"rate" is required',
            }),

            description: Joi.string().required().messages({
                "string.base": '"description" must be a string',
                "any.required": '"description" is required',
            }),

            address: Joi.string().required().messages({
                "string.base": '"address" must be a string',
                "any.required": '"address" is required',
            }),
            primaryImage: Joi.object().required().messages({
                "any.required": '"primaryImage" is required',
            }),

            secondaryImages: Joi.array().items(Joi.object()).required().messages({
                "array.base": '"secondaryImages" must be an array of files',
                "any.required": '"secondaryImages" is required',
            }),
        });

        const schema = Joi.object({
            packageId: Joi.string().uuid().required().messages({
                "string.guid": '"packageId" must be a valid UUID',
                "any.required": '"packageId" is required',
            }),

            steps: Joi.array().items(stepSchema).min(1).required().messages({
                "array.base": '"steps" must be an array',
                "array.min": '"steps" must contain at least one step',
                "any.required": '"steps" is required',
            }),
        });
        const { packageId, steps } = validateInput<typeof inputData>(schema, inputData);

        await prisma.$transaction(async (tx) => {
            for (const step of steps) {
                const { secondaryImages, ...rest } = step;
                const temp = await tx.packageStep.create({
                    data: { ...rest, packageId, primaryImageUrl: rest.primaryImage.filename },
                });

                await tx.packageStepSecondaryImages.createMany({
                    data: secondaryImages.map((image) => ({
                        packageStepId: temp.id,
                        imageUrl: image.filename,
                    })),
                });
            }
        });
    },

    createSlotAvailability: async (inputData: {
        packageId: string;
        slots: {
            start: string;
            finish: string;
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
                        start: Joi.string().isoDate().required().label("Start Date"),
                        finish: Joi.string().isoDate().required().label("Finish Date"),
                        days: Joi.number().integer().min(1).required().label("Days"),
                        nights: Joi.number().integer().min(0).required().label("Nights"),
                        initialPlace: Joi.number()
                            .integer()
                            .min(0)
                            .required()
                            .label("Initial Place"),
                    })
                )
                .min(1)
                .required()
                .label("Slots"),
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

    addImages: async (inputData: {
        files: Express.Multer.File[];
        packageId: string;
        images: {
            isPrimary: boolean;
        }[];
    }) => {
        const schema = Joi.object({
            files: Joi.array().items(Joi.object().required()).min(1).required().label("Files"),

            packageId: Joi.string().uuid().required().label("Package ID"),

            images: Joi.array()
                .items(
                    Joi.object({
                        isPrimary: Joi.boolean().required().label("Is Primary"),
                    })
                )
                .min(1)
                .required()
                .label("Images"),
        });

        const { files, packageId, images } = validateInput<typeof inputData>(schema, inputData);

        const packageExists = await prisma.package.count({
            where: { id: packageId },
        });
        if (packageExists === 0) {
            throw new ConstraintError(
                "Package does not exist",
                404,
                "NOT_FOUND",
                "package does not exist in the database"
            );
        }

        const data = await prisma.packageImage.createMany({
            data: files.map((file, index) => ({
                packageId,
                imageUrl: `${Env.BASE_URL}/uploads/documents/${file.filename}`,
                isPrimary: images[index].isPrimary,
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
        combinations?: {
            name: string;
            pension: PackagePensionType;
            price: number;
            majoration: number;
            adultsNumber: number;
            numbOfChildrenOne: number;
            numbOfChildrenTwo: number;
            babyPrice: number;
        }[];
        supplements?: {
            name: string;
            adultsNumber: number;
            numbOfChildrenOne: number;
            numbOfChildrenTwo: number;
            babyPrice: number;
        }[];
    }) => {
        const schema = Joi.object({
            userId: Joi.string().uuid().required(),

            basic: Joi.object({
                isPublic: Joi.boolean().optional().default(false),
                combination_active: Joi.boolean().optional().default(false),
                isRecommended: Joi.boolean().optional().default(false),
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

            combinations: Joi.array()
                .items(
                    Joi.object({
                        name: Joi.string().required(),
                        pension: Joi.string()
                            .valid("NONE", "FULL", "HALF", "ALL_INCLUSIVE")
                            .required(), // assuming enum values
                        price: Joi.number().min(0).required(),
                        majoration: Joi.number().min(0).required(),
                        adultsNumber: Joi.number().integer().min(0).required(),
                        numbOfChildrenOne: Joi.number().integer().min(0).required(),
                        numbOfChildrenTwo: Joi.number().integer().min(0).required(),
                        babyPrice: Joi.number().min(0).required(),
                    })
                )
                .optional(),

            supplements: Joi.array()
                .items(
                    Joi.object({
                        name: Joi.string().required(),
                        adultsNumber: Joi.number().integer().min(0).required(),
                        numbOfChildrenOne: Joi.number().integer().min(0).required(),
                        numbOfChildrenTwo: Joi.number().integer().min(0).required(),
                        babyPrice: Joi.number().min(0).required(),
                    })
                )
                .optional(),
        });

        const { basic, departures, destinations, pricePerPerson, userId } = validateInput<
            typeof inputData
        >(schema, inputData);

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

            const packageCombination = await tx.packageCombination.create({
                data: {
                    packageId: createdPackage.id,
                },
            });

            await tx.combination.createMany({
                data:
                    inputData.combinations?.map((combination) => ({
                        packageCombinationId: packageCombination.id,
                        ...combination,
                    })) || [],
            });

            const packageSupplement = await tx.packageSupplements.create({
                data: {
                    packageId: createdPackage.id,
                },
            });

            await tx.supplements.createMany({
                data:
                    inputData.supplements?.map((supplement) => ({
                        packageSupplementsId: packageSupplement.id,
                        ...supplement,
                    })) || [],
            });
            return createdPackage;
        });

        return data;
    },
};
