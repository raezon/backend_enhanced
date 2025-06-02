import prisma from "@/config/prisma";
import { Prisma } from "@prisma/client";

export const passengerRepo = {
    visaRequestExists: async (id: string) => {
        const count = await prisma.visaRequest.count({
            where: { id },
        });
        return count > 0;
    },

    create: async ({
        files,
        visaRequestId,
        ...passengerData
    }: {
        files: Express.Multer.File[];
        visaRequestId: string;
    } & Omit<Prisma.PassengerCreateInput, "visaRequest" | "passengerDocuments">) => {
        const result = await prisma.$transaction(async (tx) => {
            const passenger = await tx.passenger.create({
                data: {
                    ...passengerData,
                    visaRequest: {
                        connect: { id: visaRequestId },
                    },
                },
            });

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
                        passengerId: passenger.id,
                        documentId: savedFile.id,
                    },
                });
            }

            return passenger;
        });

        return result;
    },

    findById: async (id: string) => {
        return prisma.passenger.findUnique({
            where: { id },
            include: {
                passengerDocuments: {
                    include: {
                        passengerDocumentsFiles: true,
                    },
                },
            },
        });
    },

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
        return prisma.$transaction(async (tx) => {
            // Get all documents associated with passenger
            const documents = await tx.passengerDocuments.findMany({
                where: { passengerId: id },
                select: { documentId: true },
            });

            const fileIds = documents.map((doc) => doc.documentId);

            // Delete passenger (cascades to PassengerDocuments)
            await tx.passenger.delete({ where: { id } });

            // Delete associated files
            await tx.passengerDocumentsFiles.deleteMany({
                where: { id: { in: fileIds } },
            });

            return true;
        });
    },
};
