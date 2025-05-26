import prisma from "@/config/prisma";
import { Visa } from "@prisma/client";

interface CreateVisaDTO {
    countryId: string;
    name: string;
    price: number;
    currency: string;
    description: string;
    conditions: string;
    status: boolean;
    duration: string;
}


export const visaRepo = {
    createVisa: async (data: CreateVisaDTO): Promise<Visa> => {
        return prisma.visa.create({
            data,
        });
    },
    getVisaById: async ({ id }: { id: string }): Promise<Visa | null> => {
        return prisma.visa.findFirst({
            where: { id, deletedAt: null },
        });
    },

    updateVisa: async (
        id: string,
        data: Partial<Omit<CreateVisaDTO, "countryId">>
    ): Promise<Visa> => {
        return prisma.visa.update({
            where: { id },
            data,
        });
    },

    deleteVisa: async (id: string): Promise<Visa> => {
        // If using soft delete:
        return prisma.visa.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },

    findAllVisas: async ({ page, pageSize ,countryId}: { page: number; pageSize: number, countryId?:string }) => {
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
    }
}