import { HotelController } from "@/business-logic/controllers";
import { Router } from "express";
const router = Router();

const { createHotel, deleteHotelById, getAllHotels, getHotelById, updateHotelById } =
    HotelController;

router.post("/", createHotel);
router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.put("/:id", updateHotelById);
router.delete("/:id", deleteHotelById);

export default router;
