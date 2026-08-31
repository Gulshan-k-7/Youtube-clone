import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/Video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name} = req.body;
    
    const {videoId} = req.params;
    const owner = req.user?.id;
    if (!owner) {
            throw new ApiErrors(200, "Login first to create playlist")
        }
    console.log("name",name)
    if (!name) {
            throw new ApiErrors(200, "name of playlist required")
        }
    const playlist = await Playlist.create({
        name,
        owner,
        videos:videoId
    })
    if(!playlist){
        throw new ApiErrors(200,"playlist not created")
    }

    return res.status(200).json(new ApiResponse(200,"playlist created"))
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const userId = req.user?.id;

    const playlists = await Playlist.find({
        owner: userId
    })
        .populate(
            "videos",
            "title thumbnail duration views"
        )
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlists,
                "User playlists fetched successfully"
            )
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    // Validate playlist id
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiErrors(400, "Invalid playlist id")
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId)
        .populate(
            "videos",
            
        )
    console.log(playlist)
    if (!playlist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Playlist fetched successfully"
            )
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    // Validate ids
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiErrors(400, "Invalid playlist id")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiErrors(400, "Invalid video id")
    }

    // Check playlist exists
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiErrors(
            403,
            "You are not allowed to modify this playlist"
        )
    }

    // Check video exists
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiErrors(404, "Video not found")
    }

    // Check if video already exists in playlist
    const alreadyExists = playlist.videos.some(
        id => id.toString() === videoId.toString()
    )

    if (alreadyExists) {
        throw new ApiErrors(
            409,
            "Video already exists in playlist"
        )
    }

    // Add video id
    playlist.videos.push(videoId)

    await playlist.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Video added to playlist successfully"
            )
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    // Validate ids
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiErrors(400, "Invalid playlist id")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiErrors(400, "Invalid video id")
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    // Only playlist owner can modify it
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiErrors(
            403,
            "You are not allowed to modify this playlist"
        )
    }

    // Check whether video exists in playlist
    const videoExists = playlist.videos.some(
        id => id.toString() === videoId.toString()
    )

    if (!videoExists) {
        throw new ApiErrors(
            404,
            "Video not found in playlist"
        )
    }

    // Remove video from playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            returnDocument: "after"
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video removed from playlist successfully"
            )
        )
})

const deletePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    // Validate playlist id
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // Only playlist owner can delete it
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to delete this playlist"
        )
    }

    // Delete playlist
    await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Playlist deleted successfully"
            )
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params
    const { name } = req.body

    // Validate playlist id
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiErrors(400, "Invalid playlist id")
    }

    // Validate name
    if (!name?.trim()) {
        throw new ApiErrors(400, "Playlist name is required")
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    // Only owner can update playlist
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiErrors(
            403,
            "You are not allowed to update this playlist"
        )
    }

    // Update playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name.trim()
            }
        },
        {
            returnDocument: "after"
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}