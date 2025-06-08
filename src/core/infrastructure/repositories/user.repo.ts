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
