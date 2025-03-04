import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/likes.controller.js";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";
const router = Router()

router.post("/:videoId",verifyJWT, toggleVideoLike)
router.post("/:commentId",verifyJWT, toggleCommentLike)
router.post("/:tweetId",verifyJWT, toggleTweetLike)
router.get("/alllikes",verifyJWT, getLikedVideos)


export default router