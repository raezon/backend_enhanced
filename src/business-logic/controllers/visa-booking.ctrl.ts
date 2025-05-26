import { TryCatchBlock } from "@business/app/base/try-catch-block";
import { Request, Response } from "express";
import { visaBookingRepo } from "@business/models/visa-booking.repo";

export const visaBookingController = {
    requestVisa: TryCatchBlock(async (req:Request , res:Response)=>{
        const data = await visaBookingRepo.createVisaBooking(req.body);
        res.status(201).json({
            message: "Visa booking request created successfully",
            data,
        });
    }),

    getAllVisaBookings: TryCatchBlock(async (req:Request , res:Response)=>{
        const { page = 1, limit = 10 } = req.query;
        const data = await visaBookingRepo.getAllVisaBookings({
            page: Number(page),
            limit: Number(limit),
        });
        res.status(200).json({
            message: "Visa bookings retrieved successfully",
            data,
        });
    }),

    getVisaBookingById: TryCatchBlock(async (req:Request , res:Response)=>{
        const { id } = req.params;
        const data = await visaBookingRepo.getVisaBookingById(id);
        res.status(200).json({
            message: "Visa booking retrieved successfully",
            data,
        });
    }),

    updateVisaBooking: TryCatchBlock(async (req:Request , res:Response)=>{
        const { id } = req.params;
        const data = await visaBookingRepo.updateVisaBookingById( req.body , id);
        res.status(200).json({
            message: "Visa booking updated successfully",
            data,
        });
    }),

    deleteVisaBooking: TryCatchBlock(async (req:Request , res:Response)=>{
        const { id } = req.params;
        await visaBookingRepo.deleteVisaBookingById(id);
        res.status(204).json({
            message: "Visa booking deleted successfully",
        });
    }),
}