import mongoose, { isValidObjectId } from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { View } from "../models/views.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const trackView = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { userId } = req.user._id
        if (!videoId) throw new ApiError(400, "Video ID is required")
        if (!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Video ID is Invalid")
        const newView = await View.create({
            video: videoId,
            viewedBY: userId
        })
        return res.status(200).json(
            new ApiResponse(200, newView, "View Recorded Successfully")
        )
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})

const GetTotalViews = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        if (!videoId) throw new ApiError(400, "Video ID is required")
        if (!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Video ID is Invalid")

        const totalView = await View.countDocuments({ video: videoId })
        return res.status(200).json(
            new ApiResponse(200, {totalView:totalView}, "Total View fetched Successfully")
        )
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }

})

export { trackView, GetTotalViews }