import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js' ;
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";


const registerUser = asyncHandler( async (req,res)=>{
    
    // Steps to register a user 

    //Step 1: Get user data from frontend , which in our case will come from 
    //postman , req.body will have textual data in json format but not the file 
    //data like avatar image and all
    const {username , email , fullName , password } = req.body;

    console.log("Name : " + fullName);
    console.log("Email : " + email);           //execute here then put data in raw json in postman and then send and come back here and check data printed

    //Now set up the image upload , file upload thing using multer, since multer 
    //is set up in middlewares folder now we just need to call that middleware 
    //before calling registerUser fn in user.router.js , go and see that file


    //Step 2: Validate the data , way 1 would be using JOI library but here we will do manually
    if([fullName , username , email , password].some((field)=>field?.trim() === "")){
        throw new ApiError(400 , "All fields are required");
    }
    
    

    //Approach : for each of the field in the array , we check after trimming them
    //we get empty string or not , if any field is empty we throw error , trimming means 
    //removing extra spaces before and after the string

    //Step 3 : Check if user already exists with same email or username

    const isExists = await User.findOne({ $or : [{username} , {email}] });
    if(isExists){
        throw new ApiError(409 , "User already exists");
    }

    //Step 4 : Check if files are present in req.files (added by multer middleware)
    const localAvatarFile = await req.files?.avatar[0]?.path ;
    // const localCoverImageFile = await req.files?.coverImage[0]?.path ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        var localCoverImageFile = req.files.coverImage[0].path ;
    }


    //This syntax is for optional chaining , if req.files is undefined it will not throw error 
    //Its like first we check req.files is defined or not , if defined then we access avatar property of it and its 0 index , if avatar[0] is defined then we access its path property 
    //If in the middle any property is undefined it will return undefined instead of throwing error that we are trying to access a property of undefined 

    if(!localAvatarFile){
        throw new ApiError(400 , "Avatar image is required");
    }
    //Cover image is optional so we dont check for it

    //Step 5 : Upload files to cloudinary using utility function
    const avatar = await uploadToCloudinary(localAvatarFile);
    const coverImage = await uploadToCloudinary(localCoverImageFile);

    if(!avatar){
        throw new ApiError(500 , "Error in uploading avatar image");
    }
    
    //Step 6 : Create user in DB
    const newUser = await User.create({
        username : username.toLowerCase(),
        email,
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "" ,
        password
    })

    //Step 7 : Removing crucial details like password before sending response to frontend
    const createdUser = await User.findOne({_id : newUser._id}).select('-password -refreshToken');

    if(!createdUser){
        throw new ApiError(500 , "Error in creating user");
    }

    //Step 8 : Send response to frontend
    res.status(201).json(
        new ApiResponse(201 , createdUser , "User registered successfully")
    );
})

export {registerUser};