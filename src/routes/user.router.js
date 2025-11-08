import express from 'express';
import { loginUser, logoutUser, registerUser , refreshAccessToken } from '../controllers/user.controller.js';
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

export default router;

