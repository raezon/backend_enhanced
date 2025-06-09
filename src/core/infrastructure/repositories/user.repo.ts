import { prisma } from "@/config";
import { User } from "@/core/domains/user";
import { Prisma } from "@prisma/client";

export const userRepo = {
    updatePassword: async ({ password, email }: { password: string; email: string }) => {
        const data = await prisma.user.update({
            where: {
                email,
            },
            data: {
                password,
                userActive: true,
            },
        });

        return new User(data);
    },

    findUserByUsername: async ({ username }: { username: string }) => {
        const data = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        return data ? new User(data) : null;
    },
    findUserByEmail: async ({ email }: { email: string }) => {
        const data = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        return data ? new User(data) : null;
    },

    findUserById: async ({ id }: { id: string }) => {
        const data = await prisma.user.findUnique({
            where: {
                id,
            },
        });

        return data ? new User(data) : null;
    },

    create: async (data: Prisma.UserCreateInput) => {
        const { adminActive, userActive, ...rest } = data;
        const newUser = await prisma.user.create({
            data: {
                ...rest,
                userActive: userActive ?? true,
                adminActive: adminActive ?? false,
            },
        });
        return new User(newUser);
    },

    findAll: async ({ limit, page }: { page: number; limit: number }) => {
        const skip = (page - 1) * limit;
        const users = await prisma.user.findMany({
            skip,
            take: limit,
            select: {
                adminActive: true,
                id: true,
                createdAt: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                role: true,
                userRoles: true,
                connection_from_outside: true,
            },
        });

        return users;
    },

    delete: async ({ id }: { id: string }) => {
        const user = await prisma.user.delete({
            where: {
                id,
            },
        });

        return user;
    },
};
