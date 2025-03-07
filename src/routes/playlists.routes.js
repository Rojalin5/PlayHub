import { Router } from "express";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, updatePlaylist ,removeVideoFromPlaylist} from "../controllers/playlist.controller.js";

const router = Router()

router.post("/createplaylist", verifyJWT,createPlaylist)
router.get("/users/:userId", verifyJWT, getUserPlaylists)
router.get("/:playlistId", verifyJWT, getPlaylistById)
router.delete("/:playlistId/videos/:videoId", verifyJWT, removeVideoFromPlaylist)
router.post("/:playlistId/videos/:videoId", verifyJWT, addVideoToPlaylist)
router.delete("/:playlistId", verifyJWT, deletePlaylist)
router.patch("/:playlistId", verifyJWT, updatePlaylist)

export default router;