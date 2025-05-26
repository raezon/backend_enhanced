import prisma from '@config/prisma';

export interface CreateRoleDto {
    name: string;
    isDefault: boolean;
    permissionIds: string[];
}

export const roleRepo = {
    createRole: async (role: CreateRoleDto) => {
        return prisma.$transaction(async (tx) => {
            const createdRole = await tx.role.create({
                data: {
                    name: role.name,
                    isDefault: role.isDefault ?? false,
                },
            });

            if (role.permissionIds?.length > 0) {
                await tx.rolePermissions.createMany({
                    data: role.permissionIds.map((permissionId) => ({
                        roleId: createdRole.id,
                        permissionId,
                    })),
                    skipDuplicates: true,
                });
            }

            return createdRole;
        });
    },

    findAll:async()=>{
        return prisma.role.findMany({
            select: {
                id: true,
                name: true,
                isDefault: true,
                createdAt: true,
                deletedAt: true,
            },
        });
    }
};
