import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

export const passengerRepo = {
    update: async (
        id: string,
        {
            files,
            deletedDocs,
            ...passengerData
        }: {
            files?: Express.Multer.File[];
            deletedDocs?: string[];
        } & Partial<Prisma.PassengerUpdateInput>
    ) => {
        return prisma.$transaction(async (tx) => {
            // Update passenger data
            const updatedPassenger = await tx.passenger.update({
                where: { id },
                data: passengerData,
            });

            // Handle document deletions
            if (deletedDocs && deletedDocs.length > 0) {
                // Get file IDs before deleting documents
                const documents = await tx.passengerDocuments.findMany({
                    where: { id: { in: deletedDocs }, passengerId: id },
                    select: { documentId: true },
                });

                const fileIds = documents.map((doc) => doc.documentId);

                // Delete passenger documents
                await tx.passengerDocuments.deleteMany({
                    where: { id: { in: deletedDocs }, passengerId: id },
                });

                // Delete associated files
                await tx.passengerDocumentsFiles.deleteMany({
                    where: { id: { in: fileIds } },
                });
            }

            // Handle new file uploads
            if (files && files.length > 0) {
                for (const file of files) {
                    const savedFile = await tx.passengerDocumentsFiles.create({
                        data: {
                            filePath: file.path,
                            fileType: file.mimetype,
                            name: file.originalname,
                        },
                    });

                    await tx.passengerDocuments.create({
                        data: {
                            passengerId: id,
                            documentId: savedFile.id,
                        },
                    });
                }
            }

            return updatedPassenger;
        });
    },

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
                // Create the passenger
                const passenger = await tx.passenger.create({
                    data: {
                        ...passengerData,
                        visaRequest: {
                            connect: {
                                id: visaRequestId,
                            },
                        },
                    },
                });

                console.log("Passenger created:", passenger);

                // Create each file + link in passengerDocuments
                for (const file of files) {
                    const savedFile = await tx.passengerDocumentsFiles.create({
                        data: {
                            filePath: file.filename, // stored filename only
                            fileType: file.mimetype,
                            name: file.originalname,
                        },
                    });
                    console.log("File saved:", savedFile);
                    const doc = await tx.passengerDocuments.create({
                        data: {
                            passengerId: passenger.id,
                            documentId: savedFile.id,
                        },
                    });

                    console.log("Document created:", doc);
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
