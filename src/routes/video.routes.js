import{ Router} from "express"
import { upload } from "../middlewares/multer.middlewares.js"
import { publishVideo } from "../controllers/video.controller.js"
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

export default router
