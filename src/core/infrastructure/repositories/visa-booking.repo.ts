import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

export const visaBookingRepo = {
    update: async (        inputData: Prisma.VisaRequestUpdateInput & { visaId: string; id: string }) => {},

    exists: async ({ id }: { id: string }) => {
        const count = await prisma.visaRequest.count({
            where: {
                id,
            },
        });

        return count > 0;
    },

    delete: async ({ id }: { id: string }) => {
        await prisma.visaRequest.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    },

    findOne: async ({ id }: { id: string }) => {
        const result = await prisma.visaRequestPivot.findUnique({
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

        return result;
    },

    findAll: async ({ limit, page }: { page: number; limit: number }) => {
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

    create: async (data: Prisma.VisaRequestCreateInput & { visaId: string }) => {
        const { visaId, ...rest } = data;

        const result = await prisma.$transaction(async (tx) => {
            const createdVisaRequest = await tx.visaRequest.create({
                data: {
                    ...rest,
                },
                select: {
                    id: true,
                },
            });
            await tx.visaRequestPivot.create({
                data: {
                    visaId,
                    visaRequestId: createdVisaRequest.id,
                },
            });

            return createdVisaRequest.id;
        });

        return result;
    },
};
