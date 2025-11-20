import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile : {
        type : String,                    // URL of the video file stored in cloudinary or any other service
        required : true,
        message : "URL of the video file"
    },
    thumbnail : {
        type : String,                    // URL of the thumbnail image stored in cloudinary or any other service
        required : true,
        message : "URL of the thumbnail image"
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    duration : {
        type : Number,                    // Duration in seconds obrtained from cloudinary or any other service
        required : true
    },
    views : {
        type : Number,
        default : 0
    },
    isPublished : {
        type : Boolean,
        default : true
    }, 
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',                    // Referencing User model
        required : true
    }, 
    
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);