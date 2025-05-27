import prisma from "@config/prisma";

export const passengerRepo = {
    create : async (data: {
        visaRequestId: string;
        name: string;
        surname: string;
        placeOfBirth: string;
        dateOfBirth: Date | string;
        passportNumber: string;
        passportDeliveryDate: Date | string;
        passportExpirationDate: Date | string;
        email: string;
        phone: string;
        docs: string[]; // Assuming base64 strings or file names; use `File[]` if handling directly in frontend
    }) =>{
        const result = await prisma.$transaction(async ctx => {
            const { docs, ...passengerData } = data;
            const passenger = await ctx.passenger.create({
                data: {
                    ...passengerData,
                },
            });
        })
    }
}