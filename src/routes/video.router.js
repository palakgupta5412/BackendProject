import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { deleteVideo, getVideoById, publishAVideo, updateVideo } from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/uploadVideo').post(verifyJWT , 

    //multer middleware called to temporarily store files
    upload.fields([
        {
            name : 'thumbnail',
            maxCount : 1 
        },
        {
            name : 'video',
            maxCount : 1
        }
    ]) ,

    //controller
    publishAVideo
)

router.route('/getVideoById/:videoId').get(getVideoById);
router.route('/updateVideoDetails/:videoId').patch(verifyJWT , upload.single('thumbnail') , updateVideo);
router.route('/deleteVideo/:videoId').delete(verifyJWT , deleteVideo);
export default router;