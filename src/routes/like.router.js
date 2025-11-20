import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = express.Router();

router.route('/likeVideo/:videoId').post(verifyJWT , toggleVideoLike);
router.route('/likeComment/:commentId').post(verifyJWT , toggleCommentLike);
router.route('/likeTweet/:tweetId').post(verifyJWT , toggleTweetLike);
router.route('/getLikedVideos').get(verifyJWT , getLikedVideos);

export default router ;