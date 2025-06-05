import express from "express"
import publicRoutes from "./public"
import privateRoutes from "./private"
import { checkAuth } from "@/middlewares/check-auth"

const router = express.Router()

router.use("/public", publicRoutes)
router.use("/private", checkAuth, privateRoutes)

export default router
