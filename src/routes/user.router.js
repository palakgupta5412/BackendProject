import express from 'express';
import { loginUser, logoutUser, registerUser , refreshAccessToken, changePassword, updateTextualUserDetails, updateAvatar, updateCoverIMG, getUserChannelProfile, getWatchHistory } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register' , 

    // middleware after route and before controller 
    upload.fields([
        {
            name : 'avatar',
            maxCount : 1
        },
        {
            name : 'coverImage',
            maxCount : 1
        }]) ,
        
        registerUser);

router.route('/login').post(loginUser);

// Secured route
router.route('/logout').post(verifyJWT , logoutUser);
router.route('/refresh').post(refreshAccessToken);

router.route('/changepassword').post(verifyJWT , changePassword);
router.route('/updatedetails').patch(verifyJWT , updateTextualUserDetails);
router.route('/updateavatar').patch(verifyJWT , upload.single('avatarLocalPath'), updateAvatar);
router.route('/updatecover').patch(verifyJWT , upload.single('coverLocalPath'), updateCoverIMG);

router.route('/channel/:username').get(verifyJWT , getUserChannelProfile);
router.route('/history').get(verifyJWT , getWatchHistory);


export default router;

