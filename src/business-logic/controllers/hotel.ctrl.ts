import { Request, Response } from "express";
import { TryCatchBlock } from "../app/base/try-catch-block";
import { hotelRepo } from "../models";
import { ConstraintError } from "../app/base/constraint-error";

export const HotelController = {
    createHotel: TryCatchBlock(async (req: Request, res: Response) => {
        const newHotel = await hotelRepo.create({ hotel: req.body });

        res.status(201).json({
            message: "Hotel created successfully",
            data: newHotel,
        });
    }),
    getAllHotels: TryCatchBlock(async (req: Request, res: Response) => {
        const { limit = 10, page = 1 } = req.query;
        const hotels = await hotelRepo.getAll({
            limit: Number(limit),
            page: Number(page),
        });

        res.status(200).json({
            message: "Hotels retrieved successfully",
            data: hotels,
        });
    }),
    getHotelById: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;
        const hotel = await hotelRepo.findOne({ id });

        if (!hotel) {
            throw new ConstraintError("Hotel not found", 404, "NOT_FOUND", "hotel not found");
        }
        res.status(200).json({
            message: "Hotel retrieved successfully",
            data: hotel,
        });
    }),
    updateHotelById: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;
        const updatedHotel = await hotelRepo.update({ id, data: req.body });

        res.status(200).json({
            message: "Hotel updated successfully",
            data: updatedHotel,
        });
    }),
    deleteHotelById: TryCatchBlock(async (req: Request, res: Response) => {
        const { id } = req.params;
        await hotelRepo.delete({ id });

        res.status(200).json({
            message: "Hotel deleted successfully",
        });
    }),
};
