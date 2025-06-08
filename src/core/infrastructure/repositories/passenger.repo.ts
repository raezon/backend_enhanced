import { prisma } from "@/config";

export const passengerRepo = {
    findAll: async ({ visaRequestId }: { visaRequestId: string }) => {
        const passengers = await prisma.passenger.findMany({
            where: {
                visaRequestId,
                deletedAt: null,
            },
            include: {
                passengerDocuments: {
                    include: {
                        passengerDocumentsFiles: true,
                    },
                },
            },
        });

        const result = passengers.map((passenger) => {
            const allFiles = passenger.passengerDocuments.flatMap((doc) => {
                const f = doc.passengerDocumentsFiles;
                return f
                    ? {
                          ...f,
                          filePath: `${process.env.BASE_URL}/${f.filePath}`,
                      }
                    : [];
            });

            const { passengerDocuments, ...rest } = passenger;
            return {
                ...rest,
                passengerDocumentsFiles: allFiles,
            };
        });

        return result;
    },
};
