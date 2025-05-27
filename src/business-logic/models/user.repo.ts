import prisma from "@/config/prisma";

export interface CreateUserDTO {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: string;
    phoneNumber: string;
    agency: string;
    address?: string;
    userActive?: boolean;
    adminActive?: boolean;
}

export const userRepo = {
    findUserByUsername: async ({ username }: { username: string }) => {
        const data = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        return data;
    },

    findUserById: async ({ id }: { id: string }) => {
        const data = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                userActive: true,
                adminActive: true,
                phoneNumber: true,
            },
        });

        return data;
    },

    CreateNewUser: async (userData: CreateUserDTO) => {
        const { adminActive, userActive, ...data } = userData;

        const newUser = await prisma.user.create({
            data: {
                ...data,
                userActive: userActive ?? true,
                adminActive: adminActive ?? false,
            },
            select: {
                id: true,
                username: true,
            },
        });
        return newUser;
    },

    findAllUsers: async ({ limit, page }: { page: number; limit: 5 | 10 | 25 | 100 }) => {
        const skip = (page - 1) * limit;
        const users = await prisma.user.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                email: true,
                userActive: true,
                adminActive: true,
            },
        });

        return users;
    },

    deleteUser: async ({ id }: { id: string }) => {
        const user = await prisma.user.delete({
            where: {
                id,
            },
        });

        return user;
    },
};
