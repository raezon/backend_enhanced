import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

export const passengerRepo = {
    delete: async (id: string) => {
        await prisma.passenger.delete({
            where: {
                id,
            },
        });
    },
    exists: async (id: string) => {
        const count = await prisma.passenger.count({
            where: {
                id,
            },
        });

        return count > 0;
    },

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

    create: async ({
        files,
        visaRequestId,
        ...passengerData
    }: {
        files: Express.Multer.File[];
        visaRequestId: string;
    } & Omit<Prisma.PassengerCreateInput, "visaRequest" | "passengerDocuments">) => {
        try {
            const result = await prisma.$transaction(async (tx) => {
                const passenger = await tx.passenger.create({
                    data: {
                        ...passengerData,
                        visaRequest: { connect: { id: visaRequestId } },
                    },
                });

                for (const file of files) {
                    const savedFile = await tx.passengerDocumentsFiles.create({
                        data: {
                            filePath: file.filename, // Use sanitized filename
                            fileType: file.mimetype,
                            name: file.originalname,
                        },
                    });

                    await tx.passengerDocuments.create({
                        data: {
                            passengerId: passenger.id,
                            documentId: savedFile.id,
                        },
                    });
                }

                return passenger;
            });
            return result;
        } catch (error) {
            console.error("Error creating passenger:", error);
            throw new Error("Failed to create passenger");
        }
    },
};
