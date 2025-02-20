import { asyncHandler } from "../src/utils/asyncHandler";
import { Video } from "../src/models/video.model";
import { ApiResponse } from "../utils/ApiResponse";

const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
        const pageNumber = parseInt(page)
        const limitNumber = parseInt(limit)
        const skip = (pageNumber - 1) * limitNumber

        let filter = {}

        if (query) {
            filter.query = { $regex: query, $options: "i" }
        }
        if (userId) {
            filter.userId = userId
        }

        const sortOrder = sortType === "asc" ? 1 : -1;
        const sortOption = { [sortBy]: sortOrder }

        const videos = await Video.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNumber)

        const allVideos = await Video.countDocuments(filter)
        res.status(200).json(
            new ApiResponse(200, videos, "All Videos fetched Successfully",
                {
                    Page: pageNumber,
                    TotalPages: Math.ceil(allVideos / limitNumber),
                    TotalVideos: allVideos
                }
            )
        )
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})


export { getAllVideos }