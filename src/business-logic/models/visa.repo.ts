import prisma from "@/config/prisma";
import { Visa, Prisma } from "@prisma/client";

export const visaRepo = {
    createVisa: async (data: Prisma.VisaCreateInput): Promise<Visa> => {
        return prisma.visa.create({ data });
    },
    getVisaById: async ({ id }: { id: string }): Promise<Visa | null> => {
        return prisma.visa.findUnique({
            where: { id, deletedAt: null },
        });
    },

    updateVisa: async (id: string, data: Partial<Prisma.VisaCreateInput>): Promise<Visa> => {
        return prisma.visa.update({
            where: { id },
            data,
        });
    },

    deleteVisa: async (id: string): Promise<Visa> => {
        return prisma.visa.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },

    findAllVisas: async ({
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
};
