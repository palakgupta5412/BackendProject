import express from "express";
import { getVideoComments, addComment, deleteComment , updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route('/addComment/:videoId').post(verifyJWT , addComment);
router.route('/updateComment/:commentId').patch(verifyJWT , updateComment);
router.route('/deleteComment/:commentId').delete(verifyJWT , deleteComment);

export default router ;