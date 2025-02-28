import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { getAllVideos, publishVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";

const router = Router()

router.route("/videopublish").post
(upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),verifyJWT, publishVideo)

router.route("/").get(verifyJWT, getAllVideos)
router.route("/:id").get(verifyJWT, getAllVideos)
export default router;