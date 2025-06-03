import { userRepo } from "@core/infrastructure/repositories/user.repo";
import { ConstraintError } from "../base/constraint-error";
import { validate as isValidUuid } from "uuid";
import { Prisma } from "@prisma/client";
import { agencyRepo } from "@/core/infrastructure/repositories/agency.repo";
import bcrypt from "bcryptjs";

export const UserService = {
    deleteUser: async ({ id }: { id: string | null }) => {
        if (!id || typeof id !== "string" || id.trim() === "" || !isValidUuid(id)) {
            throw new ConstraintError(
                "User ID validation failed",
                400,
                "INVALID_INPUT",
                "User ID must be provided as a non-empty string"
            );
        }

        await userRepo.delete({
            id,
        });
    },
    getUserById: async ({ id }: { id: string | null }) => {
        if (!id || typeof id !== "string" || id.trim() === "" || !isValidUuid(id)) {
            throw new ConstraintError(
                "User ID validation failed",
                400,
                "INVALID_INPUT",
                "User ID must be provided as a non-empty string"
            );
        }

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

    getAllUsers: async ({ limit = 10, page = 1 }: { page: number; limit: number }) => {
        const users = await userRepo.findAll({
            page,
            limit,
        });

        return users;
    },
    createNewUser: async (inputData: Prisma.UserCreateInput & { agency: string }) => {
        const { agencyInfo, agency: agencyId, ...rest } = inputData;

        if (
            !agencyId ||
            typeof agencyId !== "string" ||
            agencyId.trim() === "" ||
            !isValidUuid(agencyId)
        ) {
            throw new ConstraintError(
                "Agency ID validation failed",
                400,
                "INVALID_INPUT",
                "Agency ID must be provided as a non-empty string"
            );
        }

        const agencyExists = await agencyRepo.agencyExists({
            id: agencyId,
        });

        if (!agencyExists) {
            throw new ConstraintError(
                "Agency not found",
                404,
                "RESOURCE_NOT_FOUND",
                `This Agency could not be found`
            );
        }

        const requiredFields = [
            "firstName",
            "lastName",
            "username",
            "email",
            "password",
            "phoneNumber",
            "address",
            "userActive",
            "connection_from_outside",
            "role",
        ];

        for (const field of requiredFields) {
            if (!rest[field]) {
                throw new ConstraintError(
                    "Missing required field",
                    400,
                    "MISSING_REQUIRED_FIELD",
                    `${field} is a required field`
                );
            }
        }

        const roles = ["agency_admin", "agent", "platforme_staff", "system_admin"];

        if (!roles.includes(rest.role)) {
            throw new ConstraintError(
                "Invalid role provided",
                400,
                "INVALID_ROLE",
                `The role '${rest.role}' is not valid. Valid roles are: ${roles.join(", ")}.`
            );
        }

        const createInput: Prisma.UserCreateInput = {
            ...rest,
            password: await bcrypt.hash(rest.password, 10),
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
