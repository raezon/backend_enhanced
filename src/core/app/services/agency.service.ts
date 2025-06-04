import { agencyRepo } from "@core/infrastructure/repositories/agency.repo";
import { Prisma } from "@prisma/client";
import { ConstraintError } from "../base/constraint-error";
import { validate as isValidUuid } from "uuid";

export const AgencyService = {
    uploadLogo: async ({ filePath, id }: { filePath: string; id: string }) => {
        if (!id || typeof id !== "string" || id.trim() === "" || !isValidUuid(id)) {
            throw new ConstraintError(
                "Agency ID validation failed",
                400,
                "INVALID_INPUT",
                "Agency ID must be provided as a non-empty string"
            );
        }

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
        const requiredFields = [
            "agencyName",
            "RIZCode",
            "email",
            "website",
            "agencyAddress",
            "phoneNum1",
            "phoneNum2",
            "phoneNum3",
            "MFAType",
            "activated",
            "isCompany",
            "useTravelersProfiles",
        ];

        for (const field of requiredFields) {
            if (data[field] === undefined) {
                throw new ConstraintError(
                    "Missing required field",
                    400,
                    "MISSING_REQUIRED_FIELD",
                    `${field} is a required field`
                );
            }
        }

        const result = await agencyRepo.create(data);
        return result;
    },

    getAllAgencies: async ({ page, limit }: { page: number; limit: number }) => {
        const data = await agencyRepo.findAll({ limit, page });
        return data;
    },

    getAgencyById: async ({ id }: { id: string | undefined }) => {
        if (!id || typeof id !== "string" || id.trim() === "" || !isValidUuid(id)) {
            throw new ConstraintError(
                "Agency ID validation failed",
                400,
                "INVALID_INPUT",
                "Agency ID must be provided as a non-empty string"
            );
        }

        const data = await agencyRepo.findOne({ id });

        if (!data) {
            throw new ConstraintError("Agency not found", 404, "NOT_FOUND", "Agency not found");
        }

        return data;
    },

    createNewAccountingAgency: async (
        inputData: Prisma.AccountingCreateInput & { agencyId: string }
    ) => {
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
            "agencyCommissionLowCoTick",
            "hideEtickectPrice",
            "hideHotelVoucherPrice",
            "hideCancellationPoliciesOnHotelVoucher",
        ];

        for (const field of requiredFields) {
            if (rest[field] === undefined) {
                throw new ConstraintError(
                    "Missing required field",
                    400,
                    "MISSING_REQUIRED_FIELD",
                    `${field} is a required field`
                );
            }
        }

        const createInput: Prisma.AccountingCreateInput = {
            ...rest,
            agencyInfos: {
                connect: {
                    id: agencyId,
                },
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
            "localAutherizedOverdraw",
            "confirmBooking",
            "GDSBookWithoutBalance",
            "foreignCurrencycCertAuthorization",
        ];

        for (const field of requiredFields) {
            if (rest[field] === undefined) {
                throw new ConstraintError(
                    "Missing required field",
                    400,
                    "MISSING_REQUIRED_FIELD",
                    `${field} is a required field`
                );
            }
        }

        const createInput: Prisma.AuthorationCreateInput = {
            ...rest,
            agencyInfos: {
                connect: {
                    id: agencyId,
                },
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
