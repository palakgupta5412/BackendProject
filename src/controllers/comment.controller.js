import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const comment = req.body ;
    const videoId = req.params.videoId ;

    const owner = req.user._id ;
    const newComment = await Comment.create({
        ...comment,
        video : videoId,
        owner
    })
    res.status(201)
    .json(
        new ApiResponse(201 , newComment , "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const commentId = req.params.commentId ;
    const comment = req.body ;

    const updatedComment = await Comment.findByIdAndUpdate(commentId , comment , {
        new : true
    })
    res.status(200)
    .json(
        new ApiResponse(200 , updatedComment , "Comment updated successfully")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const commentId = req.params.commentId ;
    const comment = await Comment.findByIdAndDelete(commentId)
    if(!comment){
        throw new ApiError(404 , "Comment not found");
    }
    res.status(200)
    .json(
        new ApiResponse(200 , null , "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}