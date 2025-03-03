import { Router } from "express";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";
import { getVideoComments ,addComment,updateComment,deleteComment} from "../controllers/comments.controller.js";

const router = Router()

router.get("/:videoId",verifyJWT, getVideoComments)
router.post("/:videoId",verifyJWT, addComment)
router.patch("/:commentId",verifyJWT, updateComment)
router.delete("/:commentId",verifyJWT, deleteComment)
export default router