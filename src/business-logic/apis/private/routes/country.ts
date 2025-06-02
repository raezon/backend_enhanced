import { Router } from "express";
import { countryController } from "@business/controllers/country.ctrl";
const router = Router();

const { getAllCountry, getAllCountriesWithVisa } = countryController;

router.get("/", getAllCountry);
router.get("/offers", getAllCountriesWithVisa);

export default router;
