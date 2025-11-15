import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js' ;
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async(userId) => {
    const currUser = await User.findById(userId); 
    const accessToken = currUser.generateAccessToken();
    const refreshToken = currUser.generateRefreshToken();
    
    if(refreshToken){
        currUser.refreshToken = refreshToken;
        await currUser.save({ validateBeforeSave : false }); // we dont want to run validation again while saving refresh token
    }
    
    return { accessToken , refreshToken  };
}

// Enter data in postman -> body -> form data 
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

//Enter data in postman -> body -> urlencoded 
const loginUser = asyncHandler( async (req,res)=>{
    // Steps to login a user 

    // Step 1: Get user data from frontend
    console.log(req);
    
    const { username , password , email} = req.body;
    if(!(username || email)){
        throw new ApiError(400 , "Email or username are required");
    }

    // Step 2: Check if user exists with given email/username
    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404 , "User not found");
    }

    // Step 3: If exists, check password
    const isPasswordValid = await user.isPasswordValid(password);
    if(!isPasswordValid){
        throw new ApiError(401 , "Invalid password");
    }
    // Step 4: Generate JWT tokens (access token and refresh token)
    const { accessToken , refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Step 5: Store refresh token in DB
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');
    
    const options = {
        httpOnly : true,    
        secure : true,

        //These above actions now allow only backend to access the cookie not frontend javascript code
    }

    // Step 6: Send response to frontend with access token and user details -> cookie
    // Here in response we have a cookie method which sets the cookie in the
    // response header and this cookie will be stored in the user's browser and 
    // could be accesssed through req.cookies in subsequent requests from the user 
    return res.status(200)
    .cookie("accessToken", accessToken , options)   //Adds a cookie (key-value data stored in the user's browser) named "accessToken" with the value of the variable accessToken 
    .cookie("refreshToken", refreshToken , options)    //Similarly, adds a cookie with the name "refreshToken" containing the refresh token for session management, using the provided options.
    .json(
        // According to the ApiResponse Class providing the status code, data and message
        new ApiResponse(200 , { user : loggedInUser , accessToken , refreshToken } , "User logged in successfully")
    );

});

// LOGIC : In Register and Login we were getting the details like name, username, email from the req.body to fetch user details 
// but in logout we dont have any such details coming from req.body so that we can delete these temporary cookies from the browser
// and delete the refresh token from the database. For that we need user details to access user and do so
// Our idea is to prepare a middleware which will run before logout fn that will verify the access token from the cookies we made 
// in login and fetch from req.cookies and then fetch payload(data) from this access token as we have seen in the code of generateAccessToken
// we encode all the data and generate a token and here we will decode that token to get the data and then using that data we will fetch user from DB
// and attach that user to req object as req.user=user so that in logout fn we can access req.user and get user details and then delete refresh token from DB

const logoutUser = asyncHandler( async (req,res)=>{
    
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set : { refreshToken : undefined }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true,
    }

    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(200 , null , "User logged out successfully")
    );

});

const refreshAccessToken = asyncHandler( async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401 , "Refresh token is missing");
    }
    try {
        
        // we can decode this refresh token and fetch user id 
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
    
        if(!decodedToken){
            throw new ApiError(401 , "Invalid refresh token");
        }
    
        const user = await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401 , "User not found");
        }
    
        // Now checking if the refreshToken this fetched user has is same as the one in cookies
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401 , "Refresh token is used or expired");
        }
    
        const options = {
            httpOnly : true,
            secure : true,
        }
    
        const { accessToken , newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    
        return res.status(200)
        .cookie("accessToken", accessToken , options)   
        .cookie("refreshToken", newRefreshToken , options)    
        .json(
            new ApiResponse(200 , { accessToken , refreshToken : newRefreshToken } , "Access token refreshed successfully")
        );
    } catch (error) {
        throw new ApiError(401 , error.message || "Invalid refresh token");
    }
});

const changePassword = asyncHandler(async (req, res)=>{

    const {oldPassword , newPassword} = req.body ;

    if(!oldPassword || !newPassword){
        throw new ApiError(400 , "Old password and new password are required");
    }

    // Here also we dont have  direct access to user details therefore , we will use 
    // the same approach of using the refreshToken from cookies to fetch the user details
    // and adding user to req so that can be easilty accessed in req.user 
    // and this we have done in auth.middleware.js so we just need to use this middleware
    // before this fn

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404 , "User not found");
    }

    console.log("user  : " , user);
    // we need to match the oldPasssword in db with the one in req.body
    const isPasswordValid = await user.isPasswordValid(oldPassword);
    if(!isPasswordValid){
        throw new ApiError(401 , "Invalid old password");
    }

    user.password = newPassword ;
    await user.save();         // in model we have added pre hook to hash the password every time there is any change in password

    res.status(200).json(
        new ApiResponse(200 , null , "Password changed successfully")
    );
})

const updateTextualUserDetails = asyncHandler(async (req , res)=>{

    const { username , email } = req.body ;

    if(!username && !email){
        throw new ApiError(400 , "Username and email are required");
    }

    // const user = await User.findByIdAndUpdate(
    //     req.user._id,
    //     {
    //         $set : { username : username , email }   // either way is right
    //     },
    //     {   // to return the updated document
    //         new : true
    //     }
    // ).select('-password');/

    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404 , "User not found");
    }

    user.username = username ;
    user.email = email ;
    await user.save({ validateBeforeSave : false });

    res.status(200).json(
        new ApiResponse(200 , user , "User details updated successfully")
    );
})

const getUser = asyncHandler(async (req , res)=>{
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    res.status(200).json(
        new ApiResponse(200 , user , "User details fetched successfully")
    );
})

const updateAvatar = asyncHandler (async (req,res)=>{

    // to get new image url from multer
    const avatarLocalPath = req.file?.path ;
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar image is not fetched");
    }

    // Uploading to cloudinary from temporary multer storage
    const avatarCloudinaryURL = await uploadToCloudinary(avatarLocalPath);
    if(!avatarCloudinaryURL){
        throw new ApiError(500 , "Error in uploading avatar image");
    }

    let user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : { avatar : avatarCloudinaryURL.url }
        },
        {   // to return the updated document
            new : true
        }
    )

    res.status(200).json(
        new ApiResponse(200 , user , "Avatar updated successfully")
    );

})

const updateCoverIMG = asyncHandler (async (req,res)=>{

    // to get new image url from multer
    const coverLocalPath = req.file?.path ;
    if(!coverLocalPath){
        throw new ApiError(400 , "Cover image is not uploaded");
    }

    // Uploading to cloudinary from temporary multer storage
    const coverCloudinaryURL = await uploadToCloudinary(coverLocalPath);
    if(!coverCloudinaryURL){
        throw new ApiError(500 , "Error in uploading cover image to cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : { coverImage : coverCloudinaryURL.url }
        },
        {   // to return the updated document
            new : true
        }
    )

    res.status(200).json(
        new ApiResponse(200 , user , "cover image updated successfully")
    );

})

// Using Aggregation Pipeline
const getUserChannelProfile = asyncHandler(async (req , res)=>{
    const {username} = req.params ;   //Will get username from url to fetch more details
    
    if(!username?.trim()){
        throw new ApiError(400 , "Username is not fetched ");
    }
    
    const channel = await User.aggregate([
        //Stage 1 which will give us the user details
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        //Stage 2 which will give subscribers of this channel user , by joining channels collection with users collection and finding all userss from Subscription schema where channel is this user
        {
            $lookup : {
                from : "subscriptions",   //Since in database schema saved in lowercase and plural
                localField : "_id" , 
                foreignField : "channel" , 
                as : "subscribers"    //array of subscribers of this channel
            }
        },

        //Stage 3 to count how many channels I have subscribed to
        {
            $lookup : {
                from : "subscriptions",   //Since in database schema saved in lowercase and plural
                localField : "_id" , 
                foreignField : "subscriber" , 
                as : "subscribedTo"    //array of channel user has subscribed to
            }
        },

        // Stage 4 : Adding this subscribers and subscribed to fields to user document
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"    //$ since it is a field now 
                },
                subscribedToCount : {
                    $size : "$subscribedTo"   //Stores the size of this array 
                },
                //Another field for that button if we follow this channel or not (follow == subscribed)
                isSubscribed : {
                    $cond : {
                        $if : {
                            $in : [req.user?._id , "$subscribers.subscriber"]   //Checking if req.user._id is present in this array of objects 
                        }
                        ,then : true
                        ,else : false
                    }
                }
            }
        },

        //Stage 5 : Projecting user this data 
        {
            $project : {
                _id : 1,
                username : 1,
                fullName : 1,
                avatar : 1,
                coverImage : 1,
                subscribersCount : 1,
                subscribedToCount : 1,
                isSubscribed : 1
        }}

    ])

    if(!channel?.length){
        throw new ApiError(404 , "Channel not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , channel[0] , 
        "Channel details fetched successfully"
    ));

})

const getWatchHistory = asyncHandler(async(req , res)=>{
    const  user = await User.aggregate([
        //Stage 1 : Getting user details using id but since the aggregation pipeline wala code is not handled by mongoose so mongoose is not able convert the object id string to normal reall id internally 
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user?._id)
            }
        },

        //Stage 2 : Every user has a watchHistory array which has ID's of all videos watched 
        //Unfolding and joining that 
        {
            $lookup : {
                from : "videos" , 
                localField : "watchHistory" , 
                foreignField : "_id" , 
                as : "watchHistory" , 

                //Nested aggregation pipeline , since we are joining videos collection with users collection but again in video collection we have a user field which is an object id of user collection
                //Unfolding that
                pipeline : [
                    {
                        $lookup : {
                            from : "users" , 
                            localField : "owner" , 
                            foreignField : "_id" , 
                            as : "owner" ,

                            //Projecting results so that owner field mein aaye 
                            pipeline : [
                            {
                                $project : {
                                    fullname : 1 ,
                                    username : 1,
                                    avatar : 1
                                }
                            },

                            //For providing data at frontend in a better way
                            {
                                $addFields : {
                                    owner : {
                                        $first : "$owner"
                                    }
                                }
                            }
                        ]
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(200 , user[0] , "Watch history fetched successfully")
    );
})

export {registerUser , loginUser , logoutUser , refreshAccessToken , changePassword , updateTextualUserDetails , getUser , updateAvatar , updateCoverIMG , getUserChannelProfile , getWatchHistory};