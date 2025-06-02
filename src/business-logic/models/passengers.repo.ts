import prisma from "@/config/prisma";

export const passengerRepo = {
    visaRequestExists: async (id: string) => {
        const count = await prisma.visaRequest.count({
            where: { id },
        });
        return count > 0;
    },

    create: async () => {},
};
