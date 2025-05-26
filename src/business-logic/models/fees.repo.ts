import prisma from "@config/prisma";

type TourCode = {
    tourcodeTitle: string;
    description: string;
    GDSProvider: string;
};

export const feesRepo = {
    createBasic: async (data: TourCode) => {
        return prisma.serviceFees.create({
            data,
        });
    },

    getAll: async ({ page, limit }: { page: number; limit: number }) => {
        const skip = (page - 1) * limit;

        const res = await prisma.serviceFees.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                tourcodeTitle: true,
                GDSProvider: true,
                itinerary: {
                    select: {
                        classes: true,
                        itinerary: true,
                        bookingFrom: true,
                        bookingTo: true,
                        departureFrom: true,
                        departureTo: true,
                        active: true,
                    },
                },
                accounting: {
                    select: {
                        percentage: true,
                        fixedPrice: true,
                    },
                },
            },
        });

        return res;
    },

    createItinerary: async (data: {
        serviceFeesId: string;
        tourcodeCompany: string;
        type: string;
        itinerary: string;
        classes: string;
        bookingFrom: string;
        bookingTo: string;
        departureFrom: string;
        departureTo: string;
        active: boolean;
    }) => {
        return prisma.itinerary.create({
            data,
        });
    },

    createAccounting: async (data: {
        serviceFeesId: string;
        fixedPrice: number;
        percentage: number;
    }) => {
        return prisma.serviceFeesAccounting.create({
            data,
        });
    },

    findServiceFeesById: async ({id}:{ id: string }) => {
        return prisma.serviceFees.findUnique({
            where: { id },
            include: { itinerary: true, accounting: true },
        });
    },
};