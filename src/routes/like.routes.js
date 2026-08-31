import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { toggleTweetLike, toggleVideoLike, toggleCommentLike, getLikedVideo } from "../controllers/like.controller.js";

const router  = Router()

router.route("/like-video/:videoId").post(verifyJWT,toggleVideoLike)
router.route("/like-comment/:commentId").post(verifyJWT,toggleCommentLike)
router.route("/like-tweet/:tweetId").post(verifyJWT,toggleTweetLike)
router.route("/liked-videos").post(verifyJWT,getLikedVideo)

export default router