import{ Router} from "express"
import { upload } from "../middlewares/multer.middlewares.js"
import { deleteVideo, getVideoById, publishVideo, updateVideo } from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

router.route("/publish-video").post(
    verifyJWT,
    upload.fields([

        {
            name : "video",
            max : 1
        }
    ]
    ),publishVideo)

router.route("/get-video/:videoId").post(getVideoById)
router.route("/update-video/:videoId").post(upload.none(),verifyJWT, updateVideo)
router.route("/delete-video/:videoId").post(verifyJWT, deleteVideo)
    
export default router
