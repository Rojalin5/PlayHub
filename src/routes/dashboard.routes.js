import { Router } from "express";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
const router = Router()


router.get("/get-stats/:channelId",verifyJWT,getChannelStats)
router.get("/allvideos/:channelId",verifyJWT,getChannelVideos)
export default router
