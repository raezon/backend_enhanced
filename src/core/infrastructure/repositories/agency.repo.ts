import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

export const agencyRepo = {
    agencyExists: async ({ id }: { id: string }) => {
        const count = await prisma.agencyInfos.count({
            where: { id },
        });
        return count > 0;
    },

    create: async (data: Prisma.AgencyInfosCreateInput) => {
        return prisma.agencyInfos.create({
            data,
        });
    },

    findAll: async ({ page, limit }: { page: number; limit: number }) => {
        const skip = (page - 1) * limit;
        return prisma.agencyInfos.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                agencyName: true,
                phoneNum1: true,
                agencyAddress: true,
                activated: true,
                authoration: { select: { localAutherizedOverdraw: true } },
            },
        });
    },

    findOne: async ({ id }: { id: string }) => {
        return prisma.agencyInfos.findUnique({
            where: {
                id,
            },
            include: {
                logo: true,
                accounting: true,
                authoration: true,
                products: true,
                b2c: true,
            },
        });
    },

    createAccounting: async (data: Prisma.AccountingCreateInput) => {
        return prisma.accounting.create({
            data,
        });
    },
    createAuthoration: async (data: Prisma.AuthorationCreateInput) => {
        return prisma.authoration.create({
            data,
        });
    },

    createAgencyProduct: async (data: Prisma.ProductsCreateInput) => {
        return prisma.products.create({
            data,
        });
    },

    createB2c: async (data: Prisma.B2CCreateInput) => {
        return prisma.b2C.create({
            data,
        });
    },

    uploadLogo: async ({ filePath, id }: { filePath: string; id: string }) => {
        return prisma.logo.create({
            data: {
                logoPath: filePath,
                agencyId: id,
            },
        });
    },
};
