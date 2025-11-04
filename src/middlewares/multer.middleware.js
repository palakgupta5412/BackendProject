import multer from 'multer';

// two ways to store files using multer : 
// 1. storing files in memory as buffer
// 2. storing files on disk storage (local server storage)

const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null , './public/temp');          // specifying destination folder for uploads
    },
    filename : function(req, file, cb){
        cb(null , file.originalname);     // specifying the file name to be original name
    }

})

export const upload = multer({ storage : storage });

// Now this upload middleware can be used in routes to handle file uploads