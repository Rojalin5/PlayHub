import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";

const router = Router()

router.post("/createtweet",createTweet)
router.get("/users/:userId",verifyJWT,getUserTweets)
router.patch("/:tweetId",verifyJWT,updateTweet)
router.delete("/:tweetId",verifyJWT,deleteTweet)

export default router;