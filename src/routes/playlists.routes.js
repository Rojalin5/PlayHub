import { Router } from "express";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router()

router.post("/createplaylist", createPlaylist)
router.get("/users/:userId", verifyJWT, getUserPlaylists)
router.get("/:playlistId", verifyJWT, getPlaylistById)
router.post("/:playlistId/videos/:videoId", verifyJWT, addVideoToPlaylist)
router.delete("/:playlistId", verifyJWT, deletePlaylist)
router.patch("/:playlistId", verifyJWT, updatePlaylist)

export default router;