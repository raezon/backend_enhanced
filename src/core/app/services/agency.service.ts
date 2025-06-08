import { agencyRepo } from "@core/infrastructure/repositories/agency.repo";
import { Prisma } from "@prisma/client";
import { ConstraintError } from "../base/constraint-error";
import { validate as isValidUuid } from "uuid";
import Joi from "joi";
import { validateInput } from "@/utils/validate-input";

export const AgencyService = {
    uploadLogo: async ({ filePath, id }: { filePath: string; id: string }) => {
        const data = await agencyRepo.findOne({ id });

        if (!data) {
            throw new ConstraintError("Agency not found", 404, "NOT_FOUND", "Agency not found");
        }

        return agencyRepo.uploadLogo({
            filePath,
            id,
        });
    },

    createNewAgency: async (data: Prisma.AgencyInfosCreateInput) => {
        const createAgencySchema = Joi.object({
            agencyName: Joi.string().required(),
            RIZCode: Joi.string().required(),
            email: Joi.string().email().required(),
            website: Joi.string().uri().required(),
            agencyAddress: Joi.string().required(),
            phoneNum1: Joi.string().required(),
            phoneNum2: Joi.string().optional(),
            phoneNum3: Joi.string().optional(),
            MFAType: Joi.string().valid("EMAIL", "SMS", "APP").required(),
            activated: Joi.boolean().optional().default(false),
            isCompany: Joi.boolean().optional().default(false),
            useTravelersProfiles: Joi.boolean().optional().default(false),
        });

        const validatedData = validateInput(createAgencySchema, data);

        const result = await agencyRepo.create(validatedData);
        return result;
    },

    getAllAgencies: async ({ page, limit }: { page: number; limit: number }) => {
        const data = await agencyRepo.findAll({ limit, page });
        return data;
    },

    getAgencyById: async ({ id }: { id: string }) => {
        const data = await agencyRepo.findOne({ id });

        if (!data) {
            throw new ConstraintError("Agency not found", 404, "NOT_FOUND", "Agency not found");
        }

        return data;
    },

    createNewAccountingAgency: async (
        inputData: Prisma.AccountingCreateInput & { agencyId: string }
    ) => {
        const createAccountingSchema = Joi.object({
            agencyId: Joi.string()
                .guid({ version: ["uuidv4"] })
                .required()
                .messages({
                    "string.guid": "Agency ID must be a valid UUID",
                    "any.required": "Agency ID is required",
                }),

            agencyCommissionLowCoTick: Joi.number().required().messages({
                "any.required": "agencyCommissionLowCoTick is a required field",
            }),

            hideEtickectPrice: Joi.boolean().optional().default(false),
            hideHotelVoucherPrice: Joi.boolean().optional(),
            hideCancellationPoliciesOnHotelVoucher: Joi.boolean().optional().default(false),
        });

        const validatedInput = validateInput(createAccountingSchema, inputData);
        const { agencyId, ...rest } = validatedInput;

        const agencyExists = await agencyRepo.agencyExists({ id: agencyId });

        if (!agencyExists) {
            throw new ConstraintError(
                "Agency not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Agency could not be found`
            );
        }

        const createInput: Prisma.AccountingCreateInput = {
            ...rest,
            agencyInfos: {
                connect: { id: agencyId },
            },
        };

        const data = await agencyRepo.createAccounting(createInput);
        return data;
    },

    createAuthorization: async (
        inputData: Prisma.AuthorationCreateInput & {
            agencyId: string;
        }
    ) => {
        const createAuthorizationSchema = Joi.object({
            agencyId: Joi.string()
                .guid({ version: ["uuidv4"] })
                .required()
                .messages({
                    "string.guid": "Agency ID must be a valid UUID",
                    "any.required": "Agency ID is required",
                }),

            localAutherizedOverdraw: Joi.number().required().messages({
                "any.required": "localAutherizedOverdraw is a required field",
            }),
            confirmBooking: Joi.boolean().optional().default(false),
            GDSBookWithoutBalance: Joi.boolean().optional().default(false),
            foreignCurrencycCertAuthorization: Joi.boolean().optional().default(false),
        });

        const validatedInput = validateInput(createAuthorizationSchema, inputData);
        const { agencyId, ...rest } = validatedInput;

        const agencyExists = await agencyRepo.agencyExists({ id: agencyId });

        if (!agencyExists) {
            throw new ConstraintError(
                "Agency not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Agency could not be found`
            );
        }

        const createInput: Prisma.AuthorationCreateInput = {
            ...rest,
            agencyInfos: {
                connect: { id: agencyId },
            },
        };

        return await agencyRepo.createAuthoration(createInput);
    },

    createAgencyProduct: async (inputData: Prisma.ProductsCreateInput & { agencyId: string }) => {
        const { agencyId, ...rest } = inputData;

        if (
            !agencyId ||
            typeof agencyId !== "string" ||
            agencyId.trim() === "" ||
            !isValidUuid(agencyId)
        ) {
            throw new ConstraintError(
                "Agency ID validation failed",
                400,
                "INVALID_INPUT",
                "Agency ID must be provided as a non-empty string"
            );
        }

        const agencyExists = await agencyRepo.agencyExists({ id: agencyId });

        if (!agencyExists) {
            throw new ConstraintError(
                "Agency not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Agency could not be found`
            );
        }

        const requiredFields = ["flightBooking", "hotelBooking", "package", "visa"];

        for (const field of requiredFields) {
            if (!rest[field]) {
                throw new ConstraintError(
                    "Missing required field",
                    400,
                    "MISSING_REQUIRED_FIELD",
                    `${field} is a required field`
                );
            }
        }

        const createInput: Prisma.ProductsCreateInput = {
            ...rest,
            agencyInfos: {
                connect: {
                    id: agencyId,
                },
            },
        };

        return await agencyRepo.createAgencyProduct(createInput);
    },

    createB2b: async (inputData: Prisma.B2CCreateInput & { agencyId: string }) => {
        const { agencyId, ...rest } = inputData;

        if (
            !agencyId ||
            typeof agencyId !== "string" ||
            agencyId.trim() === "" ||
            !isValidUuid(agencyId)
        ) {
            throw new ConstraintError(
                "Agency ID validation failed",
                400,
                "INVALID_INPUT",
                "Agency ID must be provided as a non-empty string"
            );
        }

        const agencyExists = await agencyRepo.agencyExists({ id: agencyId });

        if (!agencyExists) {
            throw new ConstraintError(
                "Agency not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Agency could not be found`
            );
        }

        const requiredFields = [
            "country",
            "department",
            "city",
            "latitude",
            "longitude",
            "B2CpointOfSale",
        ];

        for (const field of requiredFields) {
            if (!rest[field]) {
                throw new ConstraintError(
                    "Missing required field",
                    400,
                    "MISSING_REQUIRED_FIELD",
                    `${field} is a required field`
                );
            }
        }

        const createInput: Prisma.B2CCreateInput = {
            ...rest,
            agencyInfos: {
                connect: {
                    id: agencyId,
                },
            },
        };

        return agencyRepo.createB2c(createInput);
    },
};
