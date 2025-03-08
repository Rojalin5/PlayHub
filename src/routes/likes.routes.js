import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/likes.controller.js";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";
const router = Router()

router.post("/video/:videoId",verifyJWT, toggleVideoLike)
router.post("/comment/:commentId",verifyJWT, toggleCommentLike)
router.post("/tweet/:tweetId",verifyJWT, toggleTweetLike)
router.get("/user/all-likes",verifyJWT, getLikedVideos)


export default router