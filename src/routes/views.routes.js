import { Router } from "express";
import {verifyJWT} from "../middlewares/authetication.middlewares.js"
import { GetTotalViews, trackView } from "../controllers/views.controller.js";
const router = Router()

router.post("/track-view/:videoId",verifyJWT,trackView)
router.get("/total-view/:videoId",verifyJWT,GetTotalViews)

export default router