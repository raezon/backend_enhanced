import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { flags } from "./countries";

const prisma = new PrismaClient();

const roles = ["super_admin", "system_admin", "platform_staff", "agent", "agency_admin"];

async function seedCountries() {
    console.log("Starting country seeding...");

    for (const country of flags) {
        const existingCountry = await prisma.country.findUnique({
            where: { name: country.key },
        });

        if (!existingCountry) {
            await prisma.country.create({
                data: {
                    name: country.key,
                    flagUrl: country.val,
                },
            });
            console.log(`Created country: ${country.key}`);
        } else {
            console.log(`Country already exists: ${country.key}`);
        }
    }

    console.log("Country seeding completed!");
}

async function seedAllPermission() {
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
        console.log("Permission 'all:*' created.");
    } else {
        console.log("Permission 'all:*' already exists.");
    }

    return allPermission;
}

async function seedRolesWithPermissions(allPermissionId: string) {
    for (const roleName of roles) {
        const existingRole = await prisma.role.findUnique({
            where: { name: roleName },
        });

        if (!existingRole) {
            await prisma.role.create({
                data: {
                    name: roleName,
                    isDefault: false,
                    permissions: {
                        create: {
                            permissionId: allPermissionId,
                        },
                    },
                },
            });
            console.log(`Role '${roleName}' created with 'all:*' permission.`);
        } else {
            console.log(`Role '${roleName}' already exists.`);
        }
    }
}

async function seedSuperAdminUser() {
    const superAdminRole = await prisma.role.findUnique({
        where: { name: "super_admin" },
    });

    if (!superAdminRole) {
        throw new Error("super_admin role not found! Cannot create user.");
    }

    const existingUser = await prisma.user.findUnique({
        where: { username: "superadmin" },
    });

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash("superadmin", 10);

        await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                username: "superadmin",
                email: "superadmin@example.com",
                password: hashedPassword,
                phoneNumber: "0606060606",
                address: "Some address",
                roleId: superAdminRole.id,
            },
        });

        console.log("SuperAdmin user created successfully!");
    } else {
        console.log("SuperAdmin user already exists.");
    }
}

async function main() {
    console.log("🌱 Starting seed process...");

    await seedCountries();

    const allPermission = await seedAllPermission();

    await seedRolesWithPermissions(allPermission.id);

    await seedSuperAdminUser();

    console.log("✅ Seed process completed successfully!");
}

export default main;
