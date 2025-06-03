import { Request } from "express";

export type RequestWithAuth = Request & { user: User };

export type JwtPayload = {
    id: string;
};

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
    connection_from_outside:boolean
};
