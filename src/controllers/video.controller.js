import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadToCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const { thumbnail , video } = req.files ;

    if(!thumbnail || !video){
        throw new ApiError(400 , "Thumbnail and video are required");
    }

    const thumbnailUrl = await uploadToCloudinary(thumbnail[0].path);
    const videoUrl = await uploadToCloudinary(video[0].path);

    if(!thumbnailUrl){
        throw new ApiError(500 , "Error in uploading thumbnail");
    }
    if(!videoUrl){
        throw new ApiError(500 , "Error in uploading video");
    }
    // console.log("video info from cloudinary : " , videoUrl);
    
    const newVideo = await Video.create({
        title,
        description,
        thumbnail : thumbnailUrl.url,
        videoFile : videoUrl.url,
        duration : videoUrl.duration,
        views : 0,
        likes : 0,
        owner : req.user._id       //jav verifyJWT hua hoga tab it added the user field to request and we are accessing it now
    })

    if(!newVideo){
        throw new ApiError(500 , "Error in creating video");
    }
    
    res.status(200)
    .json(
        new ApiResponse(200 , videoUrl , "Video uploaded successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.findById(videoId) ;   //All details of a video that are there in  the model  , ID includes the ranodm id ._id generated and assigned randomly

    if(!video){
        throw new ApiError(404 , "Video not found");
    }
    res.status(200)
    .json(
        new ApiResponse(200 , video , "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description} = req.body ;
    if(!title && !description){
        throw new ApiError(400 , "Title and description are required");
    }

    const thumbnail = req.file?.path ;

    if(!thumbnail){
        throw new ApiError(400 , "Thumbnail is required");
    }
    console.log("Multer Thumbnail : " , thumbnail);
    
    const thumbnailUrl = await uploadToCloudinary(thumbnail);

    console.log("Cloudinary : " , thumbnailUrl);
    
    if(!thumbnailUrl){
        throw new ApiError(500 , "Error in uploading thumbnail");
    }

    const video = await Video.findById(videoId) ;   

    if(!video){
        throw new ApiError(404 , "Video not found");
    }

    video.title = title ;
    video.description = description ;
    video.thumbnail = thumbnailUrl.url ;

    await video.save() ;

    res.status(200)
    .json(
        new ApiResponse(200 , video , "Video updated successfully")
    )

})

function getPublicIdFromUrl(url) {
  // Remove domain prefix
  const parts = url.split('/');
  // Expected URL parts example:
  // ['http:', '', 'res.cloudinary.com', 'dc8ryewn6', 'video', 'upload', 'v1763490099', 'vn143oothopwdamf9fho.mkv']
  // public ID is the part right after the version, without extension
  const versionIndex = parts.findIndex(part => part.startsWith('v'));
  const filename = parts[versionIndex + 1]; // e.g. "vn143oothopwdamf9fho.mkv"
  const publicId = filename.substring(0, filename.lastIndexOf('.')); // remove extension
  return publicId;
}

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findByIdAndDelete(videoId) ;

    if(!video){
        throw new ApiError(404 , "Video not found");
    }
    console.log("video : " , video);
    
    // Delete video from Cloudinary using public_id stored in the video document
    const publicId = getPublicIdFromUrl(video.videoFile)  // assuming this field stores Cloudinary's public ID
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }

    console.log("cloudinary video public id : " , publicId);

    res.status(200)
    .json(
        new ApiResponse(200 , null , "Video deleted successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}