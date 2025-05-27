import prisma from "@config/prisma";

export const agencyRepo = {
    findAllAgencies: async ({ page = 1, limit = 10 } : {page:number , limit:number}) => {
        const skip = (page - 1) * limit;
        return prisma.agencyInfos.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                agencyName: true,
                phoneNum1: true,
                agencyAddress: true,
                activated: true,
                accounting: { select: { localDepositBalance: true } },
                authoration: { select: { localAutherizedOverdraw: true } },
            },
        })
    },

    createAgency: async (data:{
        agencyName: string;
        RIZCode: string;
        email: string;
        website: string;
        agencyAddress: string;
        phoneNum1: string;
        phoneNum2: string;
        phoneNum3: string;
        MFAType: "EMAIL" | "MOBILE" | "GAUTH";
        activated: boolean;
        isCompany: boolean;
        useTravelersProfiles: boolean;
    }) => {
        return prisma.agencyInfos.create({
            data,
        })
    },

    createAccountingAgency: async (data:{
        agencyId: string;
        localCurrency: string;
        localDepositBalance: number;
        agencyCommissionHotel: number;
        agencyCommissionLowCoTick: number;
        hideEtickectPrice: boolean;
        hideHotelVoucherPrice: boolean;
        hideCancellationPoliciesOnHotelVoucher: boolean;
    })=>{
        return prisma.accounting.create({
            data,
        })
    },

    createAuthorizationAgency: async (data:{
        agencyId: string;
        localAutherizedOverdraw: number;
        confirmBooking: boolean;
        GDSBookWithoutBalance: boolean;
        foreignCurrencycCertAuthorization: boolean;
    })=>{
        return prisma.authoration.create({
            data,
        })
    },

    createAgencyProduct : async (data: {
        agencyId: string;
        flightBooking: boolean;
        hotelBooking: boolean;
        package: boolean;
        visa: boolean;
    }) => {
        return prisma.products.create({
            data,
        })
    },

    createB2bAgency: async (data:{
        agencyId: string;
        country: string;
        department: string;
        city: string;
        latitude: number;
        longitude: number;
        B2CpointOfSale: boolean;
    }) => {
        return prisma.b2C.create({
            data,
        })
    },

    findAgencyById: async ({id}:{id: string}) => {
        return prisma.agencyInfos.findUnique({
            where: {
                id,
            },
            include: {
                logo: true,
                accounting: true,
                authoration: true,
                products: true,
                b2c: true,
            },
        })
    },
}