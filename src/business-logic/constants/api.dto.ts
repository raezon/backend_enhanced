export type User = {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    createdAt: Date;
    userActive: boolean;
    adminActive: boolean;
    phoneNumber: string;
};