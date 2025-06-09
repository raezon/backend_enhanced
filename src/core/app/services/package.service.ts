import Joi from "joi";
import { Prisma } from "@prisma/client";
import { packageRepo } from "@/core/infrastructure/repositories/package.repo";
import { validateInput } from "@/utils/validate-input";
import { ConstraintError } from "../base/constraint-error";

export const packageService = {
    createPackage: async (
        input: Prisma.PackageCreateInput & {
            departures?: Prisma.DepartureCreateWithoutPackageInput[];
            destinations?: Prisma.DestinationCreateWithoutPackageInput[];
            pricePerPersons?: Prisma.PricePerPersonCreateWithoutUserInput[];
        }
    ) => {
        const schema = Joi.object({
            userId: Joi.string().uuid().required(),
            name: Joi.string().required(),
            displayName: Joi.string().required(),
            option: Joi.number().required(),
            departureCity: Joi.string().required(),
            type: Joi.string().valid("VACATION", "OMRA", "HADJ").required(),
            shortDescription: Joi.string().required(),
            isRecommended: Joi.boolean().optional(),
            priority: Joi.number().integer().optional(),
            description: Joi.string().allow(null, "").optional(),
            importantNote: Joi.string().allow(null, "").optional(),
            employmentContact: Joi.string().allow(null, "").optional(),
            inclusion: Joi.string().allow(null, "").optional(),
            departures: Joi.array()
                .items(Joi.object({ departureCity: Joi.string().required() }))
                .optional(),
            destinations: Joi.array()
                .items(Joi.object({ departureCity: Joi.string().required() }))
                .optional(),
            pricePerPersons: Joi.array()
                .items(
                    Joi.object({
                        displayName: Joi.string().required(),
                        name: Joi.string().required(),
                        priceAdult: Joi.number().required(),
                        priceChild6To11: Joi.number().required(),
                        priceChild2To5: Joi.number().required(),
                        priceInfant: Joi.number().required(),
                        markupPlatform: Joi.number().optional(),
                        markupAgency: Joi.number().optional(),
                    })
                )
                .optional(),
        });

        const data = validateInput(schema, input);
        return await packageRepo.create(data);
    },

    getPackageById: async (id: string) => {
        const packageData = await packageRepo.findById(id);
        return packageData;
    },

    getAllPackages: async () => {
        return await packageRepo.findMany();
    },

    updatePackage: async (
        id: string,
        input: Partial<Prisma.PackageUpdateInput> & {
            departures?: Prisma.DepartureCreateWithoutPackageInput[];
            destinations?: Prisma.DestinationCreateWithoutPackageInput[];
            pricePerPersons?: Prisma.PricePerPersonCreateWithoutUserInput[];
        }
    ) => {
        const exists = await packageRepo.exists({ id });
        if (!exists) {
            throw new ConstraintError(
                "Package not found",
                404,
                "RESOURCE_NOT_FOUND",
                "The package you're trying to update does not exist."
            );
        }

        return await packageRepo.update(id, input);
    },

    deletePackage: async (id: string) => {
        const exists = await packageRepo.exists({ id });
        if (!exists) {
            throw new ConstraintError(
                "Package not found",
                404,
                "RESOURCE_NOT_FOUND",
                "The package you're trying to delete does not exist."
            );
        }

        return await packageRepo.delete(id);
    },
};
