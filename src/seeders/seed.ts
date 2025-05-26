import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();
const resources = ["user", "hotel", "agency", "role", "auth", "permission"];
const actions = ["create", "read", "update", "delete"];

async function seedPermissions() {
    for (const resource of resources) {
        for (const action of actions) {
            const identifier = `${resource}:${action}`;

            const existing = await prisma.permission.findUnique({
                where: { identifier },
            });

            if (!existing) {
                await prisma.permission.create({
                    data: {
                        resource,
                        action,
                        identifier,
                    },
                });
            }
        }
    }
    console.log("All permissions seeded successfully!");
}

async function main() {
    await seedPermissions();

    // Check if 'all:*' permission exists
    let allPermission = await prisma.permission.findUnique({
        where: { identifier: "all:*" },
    });

    if (!allPermission) {
        allPermission = await prisma.permission.create({
            data: {
                identifier: "all:*",
                resource: "all",
                action: "*",
            },
        });
    }
    // check role superAdmin exist
    let existingRole = await prisma.role.findUnique({
        where: { name: "superadmin" },
    });
    if (!existingRole) {
        existingRole = await prisma.role.create({
            data: {
                name: "superadmin",
                isDefault: false,
                permissions: {
                    create: {
                        permissionId: allPermission.id,
                    },
                },
            },
        });
        console.log("SuperAdmin role created successfully!");
    } else {
        console.log("SuperAdmin role already exists.");
    }

    // Check if the superAdmin user already exists
    const existingUser = await prisma.user.findUnique({
        where: { username: "superadmin" },
    });

    if (!existingUser) {
        // Encrypt the password
        const hashedPassword = await bcrypt.hash("superadmin", 10);

        // Create the superAdmin user
        await prisma.user.create({
            data: {
                firstName: "Jhon",
                lastName: "Doe",
                username: "superadmin",
                email: "superadmin@example.com",
                password: hashedPassword,
                role: existingRole.id,
                phoneNumber: "0606060606",
                address: "some address",
            },
        });

        console.log("SuperAdmin user created successfully!");
    } else {
        console.log("SuperAdmin user already exists.");
    }
}

export default main;
