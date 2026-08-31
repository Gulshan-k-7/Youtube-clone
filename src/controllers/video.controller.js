import { Video } from "../models/Video.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {v2 as cloudinary} from "cloudinary"
import { User } from '../models/User.model.js';


const getAllVideo = asyncHandler(async (req, res) => {


    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query

})


const publishVideo = asyncHandler(async(req, res)=>{
    const{title, description} = req.body 
    // if ([title,description].some((field)=> field?.trim()==="")){
    //     throw new ApiErrors(200, "all field required")
    // }
    const videoLocalPath = req.files?.video?.[0]?.path
    if(!videoLocalPath){
        throw new ApiErrors(200, "video local path not found")
    }
    const owner = await req.user?.id
    
    if(!owner){
        throw new ApiErrors(200, "user not found")
    }

    const uploadVideo = await uploadOnCloudinary(videoLocalPath)
    if(!uploadVideo){
        throw new ApiErrors(200, "video not uploaded on cloudinary")
    }
    console.log("up" , uploadVideo.url)
    const video = await Video.create({
        title,
        description,
        videoFile: uploadVideo.url,
        videoPublicId: uploadVideo.public_id,
        owner
    })
    console.log("vidoe",video)
    if (!video) {
            throw new ApiErrors(500, "Something went wrong while uploading video");
        }
    
    return res.status(201).json({ success: true, message: "video uploaded successfully" });

})

const getVideoById = asyncHandler(async (req, res) => {

    console.log(req.params)

    const { videoId } = req.params

    if (!videoId) {
        throw new ApiErrors(400, "Video id not found")
    }

    const videoFile = await Video.findById(videoId)

    console.log(videoFile)

    if (!videoFile) {
        throw new ApiErrors(404, "Video may be deleted or not found")
    }

    const videoUrl = videoFile.videoFile

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videoUrl,
                "Video fetched successfully"
            )
        )
})

const updateVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body

    // Check videoId
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiErrors(400, "Video id is required")
    }

    

    // Find existing video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiErrors(404, "Video not found")
    }

    // Optional: only owner can update video
    if (video.owner.toString() !== req.user.id.toString()) {
        throw new ApiErrors(403, "You are not allowed to update this video")
    }

    // Validate text fields
    if (!title?.trim() || !description?.trim()) {
        throw new ApiErrors(400, "Title and description are required")
    }

    let thumbnailUrl = video.thumbnail

    // If new thumbnail uploaded
    if (req.file?.path) {

        const thumbnail = await uploadOnCloudinary(req.file.path)

        if (!thumbnail) {
            throw new ApiErrors(500, "Thumbnail upload failed")
        }

        thumbnailUrl = thumbnail.url
    }

    // Update video
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title.trim(),
                description: description.trim(),
                thumbnail: thumbnailUrl
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
                updatedVideo,
                "Video updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params


    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiErrors(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiErrors(
            403,
            "You are not allowed to delete this video"
        )
    }

    // Delete video from Cloudinary
    console.log("vii",video)
    const deleteVideo = await cloudinary.uploader.destroy(
            video. videoPublicId,
            {
                resource_type: "video"
            }
        )
    // if(!deleteVideo){

    // }
    console.log(video. videoPublicId)
    console.log(video._id)
console.log("de",deleteVideo)
    // Delete thumbnail from Cloudinary
    // if (video.thumbnailPublicId) {
    //     await cloudinary.uploader.destroy(
    //         video.thumbnailPublicId
    //     )
    // }

    // Delete MongoDB document
    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video deleted successfully"
            )
        )
})
const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    // Validate video id
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiErrors(400, "Invalid video id")
    }

    // Find video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiErrors(404, "Video not found")
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiErrors(
            403,
            "You are not allowed to change this video's publish status"
        )
    }

    // Toggle publish status
    video.isPublished = !video.isPublished

    // Save updated video
    await video.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                `Video ${
                    video.isPublished ? "published" : "unpublished"
                } successfully`
            )
        )
})

export {
    getAllVideo,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}