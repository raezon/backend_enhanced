import prisma from "@config/prisma";
import { Prisma } from "@prisma/client";

export const countryRepo = {
    countryExist: async (id: string) => {
        const count = await prisma.country.count({
            where: { id },
        });
        return count > 0;
    },
    create: async (data: Prisma.CountryCreateInput) => {
        return prisma.country.create({
            data,
        });
    },

    findAll: async () => {
        const data = await prisma.country.findMany({
            orderBy: { name: "asc" },
        });

        return data;
    },
    findById: async ({ id }: { id: string }) => {
        const data = await prisma.country.findUnique({ where: { id } });
        return data;
    },

    update: async (data: Partial<Prisma.CountryCreateInput>, id: string) => {
        return prisma.country.update({ where: { id }, data: data });
    },
};
