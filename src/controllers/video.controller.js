import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/videos.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { videohash } from "../utils/hashVideo.js";

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

const publishVideo = asyncHandler(async (req, res) => {
    try {
        const {title,description} = req.body;
        const videoPath = req.files?.video[0]?.path;
        if(!videoPath){
            throw new ApiError(400, "Video file is required")
        }
        const hashedVideo = await videohash(videoPath);

        const existingVideo = await Video.findOne({hash:hashedVideo})
        if(existingVideo){
            throw new ApiError(400, "Video already exists")
        }
        const thumbnailPath = req.files?.thumbnail[0]?.path;
        if(!thumbnailPath){
            throw new ApiError(400, "Thumbnail file is required")
        }
        const videoFile = await uploadOnCloudinary(videoPath);
        const thumbnailFile = await uploadOnCloudinary(thumbnailPath);
       
        const newVideo = await Video.create({
            title,
            description,
            video: videoFile.url,
            thumbnail: thumbnailFile.url,
            hash: hashedVideo,
            uploadedBy: req.user._id
        })
        if(!newVideo){
            throw new ApiError(400, "Something went wrong while uploading video")
        }
        return res.status(201).json({
            message: "Video uploaded successfully",
            success:true
     })
    }
     catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const {VideoId} = req.params;
        if(!VideoId){
            throw new ApiError(400, "VideoId is required")
        }
        const video = await Video.findById({_id:VideoId})
        if(!video){
            throw new ApiError(404,"Video not found")
        }
        res.status(200).
        json(new ApiResponse(200,video,"Video Found Successfully"))

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message || "Internal Server Error"
        })
    }
})
export { getAllVideos, publishVideo, getVideoById }