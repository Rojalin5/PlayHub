import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getVideoComments = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        if (!videoId) {
            throw new ApiError(400, "VideoId is required")
        }
        const pageNumber = parseInt(page)
        const limitNumber = parseInt(limit)
        const skip = (pageNumber - 1) * limitNumber

        const comments = await Comment.find(videoId)
            .populate("owner", "username")
            .select("content owner createdAt")
            .skip(skip)
            .limit(limitNumber)

        const allComments = await Comment.countDocuments({ video: videoId })

        res.status(200).json(
            new ApiResponse(200, comments, "All Comments fetched Successfully", {
                Page: pageNumber,
                TotalPages: Math.ceil(allComments / limitNumber),
                TotalComments: allComments
            })
        )

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message || "Internal Server Error"
            }
        )
    }
})

const addComment = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        const { content } = req.body

        if (!videoId) {
            throw new ApiError(400, "VideoId is required")
        }
        if (!content) {
            throw new ApiError(400, "Comment is required")
        }

        const newComment = await Comment.create({
            content,
            video: videoId,
            owner: req.user._id
        })

        res.status(201).json(
            new ApiResponse(201, newComment, "Comment added successfully")
        )
    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message || "Internal Server Error"
            }
        )
    }
})

const updateComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        if (!commentId) {
            throw new ApiError(400, "CommentId is required")
        }
        if (!content) {
            throw new ApiError(400, "Comment is required to update")
        }
        const comment = await Comment.findById(commentId)
        if (!comment) {
            throw new ApiError(404, "Comment not found")
        }
        comment.content = content
        await comment.save()
        res.status(200).json(
            new ApiResponse(200, comment, "Comment updated successfully")
        )

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message || "Internal Server Error"
            }
        )
    }
})

const deleteComment = asyncHandler(async(req,res)=>{
    try {
        const {commentId} = req.params;
        if(!commentId){
            throw new ApiError(400,"CommentId is required")
        }
        const comment = await Comment.findByIdAndDelete(commentId)
        if(!comment){
            throw new ApiError(404,"Comment not found")
        }
        res.status(200).json(
            new ApiResponse(200,null,"Comment deleted successfully")
        )
    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message || "Internal Server Error"
            }
        )
    }
})

export { getVideoComments, addComment, updateComment , deleteComment }