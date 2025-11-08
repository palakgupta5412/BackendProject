import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler (async(req, res, next)=>{

    try{
        // This means we are getting token from cookies since we added in res during login fn or if mobile app then from header where there is a "Authorization" key with value "Bearer <token>"
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "");
        console.log("Access token : " , accessToken);

        if(!accessToken){
            throw new ApiError(401 , "Access token is missing");
        }

        const decodedData = jwt.verify(accessToken , process.env.ACCESS_TOKEN_SECRET );
        console.log("Decoded data : " , decodedData );
        
        const user = await User.findById(decodedData?._id).select('-password -refreshToken')

        if(!user){
            throw new ApiError(401 , "Invalid access token - User not found");
        }

        req.user = user; // Attaching user data to req object so that next middlewares or controllers can access it in logout fn
        next();
    }
    catch(err){
        throw new ApiError(401 , "Invalid access token");
    }
})