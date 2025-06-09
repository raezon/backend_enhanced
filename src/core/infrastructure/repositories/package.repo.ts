import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

export const packageRepo = {
    create: async ({
        pricePerPersons,
        departures,
        destinations,
        ...data
    }: Prisma.PackageCreateInput & {
        pricePerPersons?: Prisma.PricePerPersonCreateWithoutUserInput[];
        departures?: Prisma.DepartureCreateWithoutPackageInput[];
        destinations?: Prisma.DestinationCreateWithoutPackageInput[];
    }) => {
        return prisma.package.create({
            data: {
                ...data,
                pricePerPersons: {
                    create: pricePerPersons ?? [],
                },
                departures: {
                    create: departures ?? [],
                },
                destinations: {
                    create: destinations ?? [],
                },
            },
            include: {
                pricePerPersons: true,
                departures: true,
                destinations: true,
            },
        });
    },

    // Update package with related entities (replacing all children)
    update: async (
        id: string,
        {
            pricePerPersons,
            departures,
            destinations,
            ...data
        }: Partial<Prisma.PackageUpdateInput> & {
            pricePerPersons?: Prisma.PricePerPersonCreateWithoutUserInput[];
            departures?: Prisma.DepartureCreateWithoutPackageInput[];
            destinations?: Prisma.DestinationCreateWithoutPackageInput[];
        }
    ) => {
        // Delete previous relations before recreating (to simulate replace)
        return prisma.$transaction(async (tx) => {
            await tx.pricePerPerson.deleteMany({ where: { packageId: id } });
            await tx.departure.deleteMany({ where: { packageId: id } });
            await tx.destination.deleteMany({ where: { packageId: id } });

            return tx.package.update({
                where: { id },
                data: {
                    ...data,
                    pricePerPersons: {
                        create: pricePerPersons ?? [],
                    },
                    departures: {
                        create: departures ?? [],
                    },
                    destinations: {
                        create: destinations ?? [],
                    },
                },
                include: {
                    pricePerPersons: true,
                    departures: true,
                    destinations: true,
                },
            });
        });
    },

    // Delete package (cascades handle related entities)
    delete: async (id: string) => {
        return prisma.package.delete({
            where: { id },
        });
    },

    // Find one by ID
    findById: async (id: string) => {
        return prisma.package.findUnique({
            where: { id },
            include: {
                pricePerPersons: true,
                departures: true,
                destinations: true,
            },
        });
    },

    // Find many with optional filters
    findMany: async (where?: Prisma.PackageWhereInput) => {
        return prisma.package.findMany({
            where,
            include: {
                pricePerPersons: true,
                departures: true,
                destinations: true,
            },
        });
    },

    // Check if package exists
    exists: async (where: Prisma.PackageWhereUniqueInput) => {
        const count = await prisma.package.count({ where });
        return count > 0;
    },
};
