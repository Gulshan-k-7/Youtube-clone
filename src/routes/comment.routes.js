import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middlewares.js'
import { addComment, deleteComment, updateComment } from '../controllers/comment.controller.js'

const router = Router()

router.route("/add-comment/:videoId").post(verifyJWT, addComment)
router.route("/update-comment/:commentId").post(verifyJWT, updateComment)
router.route("/delete-comment/:commentId").post(verifyJWT, deleteComment)
  
export default router