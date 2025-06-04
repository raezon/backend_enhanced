import { prisma } from "@/config";

export const countryRepo = {
    countryExist: async ({ id }: { id: string }) => {
        const result = await prisma.country.count({
            where: {
                id,
            },
        });

        return result > 0;
    },
};
