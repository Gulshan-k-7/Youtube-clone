import {loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatar, updateCoverImage, updateUserDetails} from '../controllers/user.controller.js';
import {Router} from 'express';
import {upload} from '../middlewares/multer.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
    
    router.route("/logout").post(verifyJWT, logoutUser)
    router.route("/logIn").post(loginUser)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/updateDetail").post(updateUserDetails)
    router.route("/avatarUpdate").post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            }
        ]),
        updateAvatar
        )
    router.route("/coverImageUpdate").post(
        upload.fields([
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        updateCoverImage
        )


export default router;
