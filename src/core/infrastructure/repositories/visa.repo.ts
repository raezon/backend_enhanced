import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

export const visaRepo = {
    create: async (data: Prisma.VisaCreateInput) => {
        return prisma.visa.create({
            data,
        });
    },
    findOne: async ({ id }: { id: string }) => {
        return prisma.visa.findUnique({
            where: {
                id,
            },
        });
    },

    exists: async ({ id }: { id: string }) => {
        const count = await prisma.visa.count({
            where: {
                id,
            },
        });

        return count > 0;
    },

    delete: async ({ id }: { id: string }) => {
        await prisma.visa.delete({
            where: {
                id,
            },
        });
    },

    findAll: async ({
        page,
        pageSize,
        countryId,
    }: {
        page: number;
        pageSize: number;
        countryId?: string;
    }) => {
        return prisma.visa.findMany({
            where: {
                countryId: countryId ? countryId : {},
                deletedAt: null,
                status: true,
            },
            take: pageSize,
            skip: (page - 1) * pageSize,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                countryId: true,
                name: true,
                price: true,
                currency: true,
                description: true,
                conditions: true,
                duration: true,
            },
        });
    },

    updateVisa: async (id: string, data: Prisma.VisaUpdateInput) => {
        return prisma.visa.update({
            where: { id },
            data,
        });
    },
};
