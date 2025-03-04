import { Router } from "express";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";
import { healthCheckup} from "../controllers/healthCheckup.controller.js";

const router = Router()

router.get("/",verifyJWT, healthCheckup)

export default router;