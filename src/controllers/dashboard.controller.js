import mongoose from "mongoose"
import { Video } from "../models/videos.models.js"
import { Subscription } from "../models/subscriptions.models.js"
import { View } from "../models/views.models.js"
import { Likes } from "../models/likes.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params
        const userId = req.user._id;
        if (!channelId) throw new ApiError(400, "channel ID is required")
        if (channelId !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to access");
        }

        //ALL Video
        const videoIds = await Video.find({ owner: channelId }).distinct("_id");
        if (!channelId) throw new ApiError(400, "channel ID is required")
        if (!mongoose.Types.ObjectId.isValid(channelId)) throw new ApiError(400, "channel ID is not Valid")
        const totalLikes = await Likes.countDocuments({ likedBy: channelId })
        const totalVideos = await Video.countDocuments({ owner: channelId })
        const totalSubscribers = await Subscription.countDocuments({ channel: channelId })
        const totalVideoViews = await View.countDocuments({ video: { $in: videoIds } });
        return res.status(200).json(
            new ApiResponse(200, { totalLikes, totalSubscribers, totalVideoViews, totalVideos }, "Channel stats fetched successfully"))
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params
        const userId = req.user._id;
        if (!channelId) throw new ApiError(400, "channel ID is required")
        if (channelId !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to access");
        }

        if (!mongoose.Types.ObjectId.isValid(channelId)) throw new ApiError(400, "channel ID is not Valid")
        const allVideo = await Video.find({ owner: channelId })
        return res.status(200).json(
            new ApiResponse(200, allVideo, "All Videos Fetched Successfully")
        )
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }

})

export {
    getChannelStats,
    getChannelVideos
}