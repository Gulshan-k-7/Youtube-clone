import {loginUser, logoutUser, registerUser} from '../controllers/user.controller.js';
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


export default router;
