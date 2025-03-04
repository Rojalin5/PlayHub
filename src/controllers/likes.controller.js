import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Likes } from "../models/likes.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        const userId = req.user._id
        if (!videoId) throw new ApiError(400, "Video ID is required")

        const existedLikes = await Likes.findOne({ Video: videoId, likedBy: userId })

        if (existedLikes) {
            await Likes.findByIdAndDelete(existedLikes._id)
            res.status(200).json(new ApiResponse(200, "Like removed successfully"))
        }
        const newLike = await Likes.create({ video: videoId, likedBy: userId })
        res.status(201).json(new ApiResponse(201,newLike, "Like added successfully"))
        const totalLikes = await Likes.countDocuments({ video: videoId })
        if (totalLikes === 0) {
            throw new ApiError(404, "Likes not found")
        }
    }
    catch {
        res.status(500).json(
            {
                success: false,
                message: error.message || "Internal Server Error"
            }
        )
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
  try {
      const { commentId } = req.params;
      const userId = req.user._id;
      if (!commentId) throw new ApiError(400, "Comment ID is required")
      const existedLikes = await Likes.findOne({ comment: commentId, likedBy: userId })
      if (existedLikes) {
          await Likes.findByIdAndDelete(existedLikes._id)
          res.status(200).json(new ApiResponse(200, "Like removed successfully"))
      }
      const newLike = await Likes.create({ comment: commentId, likedBy: userId })
      res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"))
  
      const totalLikes = await Likes.countDocuments({ comment: commentId })
      if (totalLikes === 0) {
          throw new ApiError(404, "Likes not found")
      }
  
  } catch (error) {
    res.status(500).json(
        {
            success: false,
            message: error.message || "Internal Server Error"
        }
    )
  }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
try {
        const {tweetId} = req.params;
        const userId = req.user._id;
        if(!tweetId) throw new ApiError(400, "Tweet ID is required")
        const existedLikes = await Likes.findOne({tweet: tweetId, likedBy: userId})
    if(existedLikes){
        await Likes.findByIdAndDelete(existedLikes._id)
        res.status(200).json(new ApiResponse(200, "Like removed successfully"))
    }
    const newLike = await Likes.create({tweet:tweetId,likedBy:userId})
    res.status(201).json(new ApiResponse(201,newLike,"Like added successfully"))
    const totalLikes = await Likes.countDocuments({tweet:tweetId})
    if(totalLikes === 0){
        throw new ApiError(404, "Likes not found")
    }
} catch (error) {
    res.status(500).json(
        {
            success: false,
            message: error.message || "Internal Server Error"
        }
    )}    
})

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const allLikedVideos = await Likes.find({likedBy:userId})
        .populate("likedBy","username")     
        .populate("video", "title description")
        .select("video createdAt")
        if(allLikedVideos.length===0){
            throw new ApiError(404,"Likes not found")
        }
        res.status(200).json(new ApiResponse(200,allLikedVideos,"Liked videos fetched successfully"))
    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message || "Internal Server Error"
            }
        )
    }
})

export { toggleVideoLike, toggleCommentLike , toggleTweetLike, getLikedVideos }