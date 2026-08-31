import { Router } from "express"
import { verifyJWT } from '../middlewares/auth.middlewares.js'
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js"
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router()

router.route("/create-playlist/:videoId").post(upload.none(), verifyJWT,createPlaylist)
router.route("/get-user-playlist").post(verifyJWT, getUserPlaylists)
router.route("/get-playlist-by-id/:playlistId").post(getPlaylistById)
router.route("/add-video-playlist/:playlistId/:videoId").post(verifyJWT,addVideoToPlaylist)
router.route("/remove-video-playlist/:playlistId/:videoId").post(verifyJWT,removeVideoFromPlaylist)
router.route("/delete-playlist/:playlistId").post(verifyJWT,deletePlaylist)
router.route("/update-playlist/:playlistId").post(upload.none(), verifyJWT,updatePlaylist)

export default router