import prisma from "@/config/prisma";
import { Hotel } from "@prisma/client";

export const hotelRepo = {
    create: async ({
        hotel,
    }: {
        hotel: {
            offerTitle: string;
            hotelName: string;
            hotelAddress: string;
            phoneNumber: string;
            contactEmail: string;
            hotelDescription: string;
            hotelImageUrl: string;
            stars: number;
            currency: string;
            price: number;
            discount?: number;
            marketType?: string;
            recommended?: boolean;
        };
    }) => {
        const data = await prisma.hotel.create({
            data: hotel,
        });

        return data;
    },

    getAll: async ({ limit, page }: { limit: number; page: number }) => {
        const skip = (page - 1) * limit;

        const data = await prisma.hotel.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                hotelName: true,
                hotelAddress: true,
                price: true,
                discount: true,
                recommended: true,
                hotelImageUrl: true,
            },
        });
        return data;
    },

    findOne: async ({ id }: { id: string }) => {
        const data = await prisma.hotel.findUnique({
            where: { id },
        });
        return data;
    },

    update: async ({ id, data }: { id: string; data: Partial<Hotel> }) => {
        return await prisma.hotel.update({
            where: { id },
            data,
        });
    },

    delete: async ({ id }: { id: string }) => {
        return await prisma.hotel.delete({
            where: { id },
        });
    },
};
