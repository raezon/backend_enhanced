import { userRepo } from "@core/infrastructure/repositories/user.repo";
import { ConstraintError } from "../base/constraint-error";
import { validate as isValidUuid } from "uuid";
import { Prisma } from "@prisma/client";
import { agencyRepo } from "@/core/infrastructure/repositories/agency.repo";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { validateInput } from "@/utils/validate-input";
import { randomBytes } from "node:crypto";

export const UserService = {
    deleteUser: async ({ id }: { id: string }) => {
        const data = await userRepo.findUserById({ id });
        if (!data) {
            throw new ConstraintError(
                "User not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This USER could not be found`
            );
        }

        await userRepo.delete({
            id,
        });
    },
    getUserById: async ({ id }: { id: string }) => {
        const data = await userRepo.findUserById({ id });

        if (!data) {
            throw new ConstraintError(
                "User not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This USER could not be found`
            );
        }

        return {
            user: data.getData(),
        };
    },

    getAllUsers: async ({ limit, page }: { page: number; limit: number }) => {
        const users = await userRepo.findAll({
            page,
            limit,
        });

        return users;
    },
    createNewUser: async (inputData: Prisma.UserCreateInput & { agency: string }) => {
        const createUserSchema = Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            phoneNumber: Joi.string().required(),
            address: Joi.string().required(),
            userActive: Joi.boolean().required(),
            connection_from_outside: Joi.boolean().required(),
            role: Joi.string()
                .valid("agency_admin", "agent", "platforme_staff", "system_admin")
                .required(),
            agency: Joi.string().guid({ version: "uuidv4" }).required().messages({
                "string.guid": "Agency ID must be a valid UUID",
            }),
        });

        const { agency: agencyId, ...rest } = validateInput<typeof inputData>(
            createUserSchema,
            inputData
        );

        const agencyExists = await agencyRepo.agencyExists({ id: agencyId });

        if (!agencyExists) {
            throw new ConstraintError(
                "Agency not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Agency could not be found`
            );
        }

        const password = randomBytes(8).toString("hex");

        // send email

        const createInput: Prisma.UserCreateInput = {
            ...rest,
            password,
            agencyInfo: {
                connect: {
                    id: agencyId,
                },
            },
        };

        const user = await userRepo.create(createInput);

        return { user: user.getData() };
    },
};
