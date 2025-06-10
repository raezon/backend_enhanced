import { Entity } from "../app/base/entity";
import bcrypt from "bcryptjs";
import { User as UserType } from "../app/base/types";
import { Role, User as UserProps } from "@prisma/client";

export class User implements Entity {
    user: UserProps & { role: Role };

    constructor(user: UserProps & { role: Role }) {
        this.user = user;
    }

    async verifyPassword(password: string): Promise<boolean> {
        if (this.user.password) {
            return await bcrypt.compare(password, this.user.password);
        }
        return false;
    }

    getData: () => UserType = () => {
        return {
            adminActive: this.user.adminActive,
            createdAt: this.user.createdAt,
            email: this.user.email,
            firstName: this.user.firstName,
            id: this.user.id,
            lastName: this.user.lastName,
            phoneNumber: this.user.phoneNumber,
            role: this.user.role.name,
            roleId: this.user.role.id,
            userActive: this.user.userActive,
            username: this.user.username,
            connection_from_outside: this.user.connection_from_outside,
        };
    };
}
