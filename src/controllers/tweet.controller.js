import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body
        const userId = req.user._id
        if (!content) throw new ApiError(400, "Content is required")
        const existedTweet = await Tweet.findOne({ content, owner: userId })
        if (existedTweet) throw new ApiError(400, "This tweet already posted")
        const newTweet = await Tweet.create({
            content,
            owner: userId
        })
        res.status(200).json(
            new ApiResponse(201, newTweet, "Tweet Created Successfully")
        )
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || !isValidObjectId(userId)) throw new ApiError(400, "UserId is required")
        const userTweets = await Tweet.find({ owner: userId })
        if (userTweets.length === 0) throw new ApiError(400,null, "No Tweet Found!")
        res.status(200).json(
            new ApiResponse(200, userTweets, "User's Tweet fetched successfully")
        )
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})

export {
    createTweet,
    getUserTweets
}
