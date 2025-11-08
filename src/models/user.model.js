import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        index : true               // Adding index for faster search
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
    }, 
    fullName : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    avatar : {
        type : String,                    // URL of the avatar image stored in cloudinary or any other service
        required : true,
        message : "URL of the avatar image"
    },
    coverImage : {
        type : String,                   
        required : false,
        message : "URL of the cover image"
    },
    watchHistory : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Video'                    // Referencing Video model
    }],
    password : {
        type : String,
        required : [true , "Password is required"],
    },
    refreshToken:{
        type : String,
    }
}, { timestamps: true });

// Pre-save hook to run a function before saving a user : 
// For example, hashing password before saving
// Dont use arrow function here to access 'this' because arrow functions do not bind 'this'

userSchema.pre('save', async function(next){
    
    // Check if password is modified or not , if not modified we move further since this pre hook will be called on every save
    if(!this.isModified('password')) return next();
    // Hash the password using bcrypt
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//In user Schemas we can add methods to compare password during login
// userSchema ke andar methods add kr skte , isPasswordMatch and generateAccessToken are name of fns we are adding to schema 

userSchema.methods.isPasswordValid = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    // The access token created has three parts encoded in it: header, payload and signature
    // Here , we are creating payload part of the token , these details can be extracted from the token later
    // signature and header are created automatically by the jwt.sign method
    return jwt.sign({
        _id : this._id,
        username : this.username,
        email : this.email,
        fullName : this.fullName
    },
    // Secret key to sign the token , should be kept in env variables
    process.env.ACCESS_TOKEN_SECRET,
    {   
        // Expiry time of the token
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);