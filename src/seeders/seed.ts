import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { flags } from "./countries";

const prisma = new PrismaClient();

const roles = ["super_admin", "custom_admin", "platform_staff", "agent", "agency_admin", "client"];

const productSections = ["flying", "hotel", "visa"];

async function seedCountries() {
    console.log("🌍 Seeding countries...");
    for (const country of flags) {
        const existing = await prisma.country.findUnique({ where: { name: country.key } });
        if (!existing) {
            await prisma.country.create({
                data: { name: country.key, flagUrl: country.val },
            });
            console.log(`Created country: ${country.key}`);
        }
    }
    console.log("✅ Country seeding done!");
}

async function createPermission(resource: string, action: string) {
    const identifier = `${resource}:${action}`;
    let permission = await prisma.permission.findUnique({ where: { identifier } });

    if (!permission) {
        permission = await prisma.permission.create({
            data: { resource, action, identifier },
        });
        console.log(`Created permission: ${identifier}`);
    }

    return permission;
}

async function seedPermissions() {
    console.log("🔐 Seeding permissions...");

    const allPermissions: any[] = [];

    // Full access permission
    allPermissions.push(await createPermission("all", "*"));

    // Platform staff permission: view all
    allPermissions.push(await createPermission("all", "view"));

    // Product-specific permissions
    for (const section of productSections) {
        allPermissions.push(await createPermission(section, "view"));
        allPermissions.push(await createPermission(section, "subscribe"));
    }

    return allPermissions;
}

async function assignPermissions(
    roleName: string,
    permissions: { resource: string; action: string }[]
) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return;

    for (const perm of permissions) {
        const identifier = `${perm.resource}:${perm.action}`;
        const permission = await prisma.permission.findUnique({ where: { identifier } });
        if (!permission) continue;

        await prisma.rolePermissions.upsert({
            where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
            create: {
                roleId: role.id,
                permissionId: permission.id,
            },
            update: {},
        });

        console.log(`→ Linked ${identifier} to role '${roleName}'`);
    }
}

async function seedRoles() {
    console.log("👥 Seeding roles...");
    for (const name of roles) {
        const exists = await prisma.role.findUnique({ where: { name } });
        if (!exists) {
            await prisma.role.create({ data: { name, isDefault: false } });
            console.log(`Created role: ${name}`);
        }
    }
}

async function seedRolePermissions() {
    // Define permission sets per role
    await assignPermissions("super_admin", [{ resource: "all", action: "*" }]);

    // custom_admin → no permissions by default

    await assignPermissions("platform_staff", [{ resource: "all", action: "view" }]);

    const productPerms = productSections.flatMap((section) => [
        { resource: section, action: "view" },
        { resource: section, action: "subscribe" },
    ]);

    for (const role of ["agent", "agency_admin", "client"]) {
        await assignPermissions(role, productPerms);
    }
}

async function seedSuperAdminUser() {
    const role = await prisma.role.findUnique({ where: { name: "super_admin" } });
    if (!role) throw new Error("Missing super_admin role");

    const exists = await prisma.user.findUnique({ where: { username: "superadmin" } });

    if (!exists) {
        const hashed = await bcrypt.hash("superadmin", 10);

        await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                username: "superadmin",
                email: "superadmin@example.com",
                password: hashed,
                phoneNumber: "0606060606",
                address: "Head Office",
                roleId: role.id,
            },
        });

        console.log("✅ Superadmin user created!");
    } else {
        console.log("ℹ️ Superadmin user already exists.");
    }
}

async function main() {
    console.log("🌱 Seeding process started...");

    await seedCountries();
    await seedPermissions();
    await seedRoles();
    await seedRolePermissions();
    await seedSuperAdminUser();

    console.log("🌟 Seeding completed successfully.");
}

export default main;
