import prisma from "@config/prisma";

export const countryRepo = {
    create: async (data:{
        name: string;
        embassyLocation: string;
        flagUrl: string;
        embassyWebsite?: string;
        embassyPhone?: string;
        embassyEmail?: string;
        embassyFax?: string;
        embassyHours?: string;
    } ) =>{
        return prisma.country.create({
            data
        })
    },

    findAll: async () => {
        const data = await prisma.country.findMany({
            orderBy: { name: 'asc' },
        });

        return data;
    },
    findById: async ({id}:{id:string}) => {
        const data = await prisma.country.findUnique({where:{id}});
        return data;
    },

    update : async (data:Partial<{
        name: string;
        embassyLocation: string;
        flagUrl: string;
        embassyWebsite?: string;
        embassyPhone?: string;
        embassyEmail?: string;
        embassyFax?: string;
        embassyHours?: string;
    }> , id:string) => {
        return prisma.country.update({where:{id} , data:data});
    }
}