import prisma from "@/config/prisma";

export const permissionRepo = {
    create:async (data: { resource: string; action: string }) => {
        const identifier = `${data.resource}:${data.action}`;

        return prisma.permission.create({
            data: {
                resource: data.resource,
                action: data.action,
                identifier
            },
        });
    },
    findAll : async () => {
        return prisma.permission.findMany({
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                resource: true,
                action: true,
            },
        });
    }
}