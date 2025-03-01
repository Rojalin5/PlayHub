import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
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

router.route("/allvideos").get(verifyJWT, getAllVideos)
router.route("/:videoId").get(verifyJWT,getVideoById)
router.route("/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideo)
router.route("/:videoId").delete(verifyJWT,deleteVideo)
router.route("/toggle/:videoId").patch(verifyJWT,togglePublishStatus)


export default router;