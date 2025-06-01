import { Router } from "express";
import { countryController } from "@business/controllers/country.ctrl";
const router = Router();

const {getAllCountry , } = countryController

router.get("/", getAllCountry);

export default router;
