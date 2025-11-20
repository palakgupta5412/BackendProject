import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    const video = await Video.findById(videoId) ;   //All details of a video that are there in  the model  , ID includes the ranodm id ._id generated and assigned randomly

    if(!video){
        throw new ApiError(404 , "Video not found");
    }

    const like = await Like.findOne({ video: videoId , likedBy : req.user._id}) ;   //All details of a video that are there in  the model  , ID includes the ranodm id ._id generated and assigned randomly
    if(!like){
        const newLike = await Like.create({
            video : videoId,
            likedBy : req.user._id,
        })
    }else{
        await Like.findByIdAndDelete(like._id)
    }

    res.status(200)
    .json(
        new ApiResponse(200 , like , "Video liked successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const comment = await Comment.findById(commentId) ;   //All details of a video that are there in  the model  , ID includes the ranodm id ._id generated and assigned randomly

    if(!comment){
        throw new ApiError(404 , "Comment not found");
    }

    const like = await Like.findOne({ comment: commentId , likedBy : req.user._id});
    if(!like){
        const newLike = await Like.create({
            comment : commentId,
            likedBy : req.user._id,
        })
    }else{
        await Like.findByIdAndDelete(like._id)
    }

    res.status(200) 
    .json(
        new ApiResponse(200 , like , "Comment liked successfully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const tweet = await Tweet.findById(tweetId) ;   //All details of a video that are there in  the model  , ID includes the ranodm id ._id generated and assigned randomly

    if(!tweet){
        throw new ApiError(404 , "Tweet not found");
    }

    const like = await Like.findOne({ tweet: tweetId , likedBy : req.user._id});
    if(!like){
        const newLike = await Like.create({
            tweet : tweetId,
            likedBy : req.user._id,
        })
    }else{
        await Like.findByIdAndDelete(like._id)
    }

    res.status(200)
    .json(
        new ApiResponse(200 , like , "Tweet liked successfully")
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.find({likedBy : req.user._id}).populate("video") ;   //All details of a video that are there in  the model  , ID includes the ranodm id ._id generated and assigned randomly
    if(!likedVideos){
        throw new ApiError(404 , "No liked videos found");
    }
    res.status(200)
    .json(
        new ApiResponse(200 , likedVideos , "Liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}