import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Playlist } from '../models/playlists.models.js'

const createPlaylist = asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body
        const userId = req.user._id
        if (!name) throw new ApiError(400, "Name is required")
        if (!description) throw new ApiError(400, "Description is required")
        const existedPlaylist = await Playlist.findOne({ name, owner: userId })
        if (existedPlaylist) throw new ApiError(400, "Playlist already exists")
        const newPlaylist = await Playlist.create({
            name,
            description,
            owner: userId
        })
        res.status(201).json(
            new ApiResponse(201, newPlaylist, "Playlist created successfully")
        )

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})
const getUserPlaylists = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) throw new ApiError(400, "User ID is required")
        const playlists = await Playlist.find({ owner: userId })
        if (playlists.length === 0) throw new ApiError(404, "No playlist found")
        if (!playlists) throw new ApiError(404, "No playlist found")
        res.status(200).json(
            new ApiResponse(200, playlists, "Playlists retrieved successfully")
        )

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"

        })
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params
        if (!playlistId) throw new ApiError(400, "Playlist ID is required")
        const playlist = await Playlist.findById(playlistId).populate("videos")
        if (!playlist) throw new ApiError(404, "Playlist not found")
        res.status(200).json(
            new ApiResponse(200, playlist, "Playlist retrieved successfully"))
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params
        const userId = req.user._id
        if (!playlistId || !videoId) throw new ApiError(400, "Both fields are required")
        const playlist = await Playlist.findOne({ _id: playlistId, owner: userId })
        if (!playlist) throw new ApiError(404, "Playlist not found")
        if (playlist.videos.some(v => v.toString() === videoId)) throw new ApiError(400, "Video is already in the playlist")
        playlist.videos.push(videoId)
        await playlist.save()
        res.status(200).json(
            new ApiResponse(200, playlist, "Video added to playlist successfully"))
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params
        const userId = req.user._id
        if (!playlistId || !videoId) throw new ApiError(400, "Both fields are required")
        const playlist = await Playlist.findOne({ _id: playlistId, owner: userId })
        if (!playlist) throw new ApiError(404, "Playlist not found")
        const videoIndex = playlist.videos.findIndex(v => v.toString() === videoId)
        if (videoIndex === -1) throw new ApiError(404, "Video Not found in the Playlist")
        playlist.videos.splice(videoIndex, 1)
        await playlist.save()
        res.status(200).json(
            new ApiResponse(200, playlist, "Video removed from playlist successfully"));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params
        if (!playlistId) throw new ApiError(400, "Playlist ID is required")
        const playlist = await Playlist.findByIdAndDelete(playlistId)
        if (!playlist) throw new ApiError(404, "Playlist not found")
        res.status(200).json(
            new ApiResponse(200, null, "Playlist deleted successfully"))

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })

    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params
        const userId = req.user._id
        const { name, description } = req.body
        if (!playlistId) throw new ApiError(400, "Playlist ID is required")
        if (!name && !description) throw new ApiError(400, "Provide at least one field to update")
        const playlist = await Playlist.findOneAndUpdate({
            _id: playlistId, owner: userId
        }, {
            $set: {
                ...(name && { name }),
                ...(description && { description })
            },
        }, { new: true })
        if (!playlist) throw new ApiError(404, "Playlist not found")
        res.status(200).json(
            new ApiResponse(200, playlist, "Playlist updated successfully")
        )
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })

    }

})
export { createPlaylist, getUserPlaylists, getPlaylistById, deletePlaylist, updatePlaylist, addVideoToPlaylist, removeVideoFromPlaylist }