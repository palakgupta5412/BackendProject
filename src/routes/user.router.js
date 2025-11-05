import express from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

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

export default router;