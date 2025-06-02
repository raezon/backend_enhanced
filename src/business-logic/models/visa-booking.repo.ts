import prisma from "@config/prisma";
import { Prisma } from "@prisma/client";

export const visaBookingRepo = {
    createVisaBooking: async (data: Prisma.VisaRequestCreateInput) => {
        return prisma.visaRequest.create({
            data,
        });
    },

    getAllVisaBookings: async ({ page, limit }: { page: number; limit: number }) => {
        const skip = (page - 1) * limit;
        const data = await prisma.visaRequestPivot.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                visa: {
                    select: {
                        country: { select: { id: true, name: true } },
                        name: true,
                    },
                },
                visaRequest: {
                    select: {
                        id: true,
                        agencyName: true,
                        agentName: true,
                        travelStartingDate: true,
                        groupSize: true,
                        totalPrice: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        return data.map((item) => ({
            id: item.visaRequest.id,
            agencyName: item.visaRequest.agencyName,
            agentName: item.visaRequest.agentName,
            country: item.visa.country,
            name: item.visa.name,
            travelStartingDate: item.visaRequest.travelStartingDate,
            groupSize: item.visaRequest.groupSize,
            totalPrice: item.visaRequest.totalPrice,
            status: item.visaRequest.status,
            createdAt: item.visaRequest.createdAt,
            updatedAt: item.visaRequest.updatedAt,
        }));
    },
    updateVisaBookingById: async (
        data: {
            travelStartingDate: string; // format: MM/DD/YYYY
            status: "Processing" | "Approved" | "Rejected" | string;
            nationality: string;
            notes: string;
        },
        id: string
    ) => {
        const { status, ...rest } = data;
        const updateRequest = await prisma.visaRequest.update({
            where: { id },
            data: {
                ...rest,
                status,
                startedAt: status === "Processing" ? new Date() : undefined,
                confirmedAt: status === "Done" || "Cancelled" ? new Date() : undefined,
            },
        });
    },

    deleteVisaBookingById: async (id: string) => {
        await prisma.visaRequest.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    },
    getVisaBookingById: async (id: string) => {
        return prisma.visaRequestPivot.findUnique({
            where: { id },
            select: {
                id: true,
                visa: {
                    select: {
                        country: true,
                        name: true,
                    },
                },
                visaRequest: {
                    select: {
                        id: true,
                        travelStartingDate: true,
                        groupSize: true,
                        status: true,
                        nationality: true,
                        totalPrice: true,
                        agencyName: true,
                        agentName: true,
                        notes: true,
                    },
                },
            },
        });
    },
};
