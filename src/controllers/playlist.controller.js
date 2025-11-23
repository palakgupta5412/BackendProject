import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if(!name || !description){
        throw new ApiError(400 , "Name and description are required");
    }

    //TODO: create a playlist
    // 1. Check for the presence of name & description.
    const playlist = await Playlist.findOne({name , description})
    if(playlist){
        throw new ApiError(400 , "Playlist already exists");
    }

    // 2. Create the playlist and add up the name & description.
    const newPlaylist = await Playlist.create({
        name,
        description,
    })

    // 3. + Add the ObjectId of the User using the middleware req.user.
    newPlaylist.owner = req.user._id

    // 4. Then, send the response.
    res.status(201)
    .json(
        new ApiResponse(201 , newPlaylist , "Playlist created successfully")
    )
})

//Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s). 
const getUserPlaylists = asyncHandler(async (req, res) => {
    const userID = req.user._id;

    if(!isValidObjectId(userID)){
        throw new ApiError(400 , "Invalid user ID");
    }

    const playlists = await Playlist.find({owner : userID})
})