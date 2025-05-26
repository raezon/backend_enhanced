import { Router } from "express";
import { countryController } from "@business/controllers/country.ctrl";
const router = Router();

const {getAllCountry , getCountry , updateCountry , createCountry} = countryController

router.post("/",createCountry);
router.put("/", updateCountry);
router.get("/:id", getCountry);
router.get("/", getAllCountry);


export default router;
