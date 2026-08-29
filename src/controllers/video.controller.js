import { Video } from "../models/Video.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    
    console.log("lklk",owner)
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
        owner
    })
    console.log("vidoe",video)
    if (!video) {
            throw new ApiErrors(500, "Something went wrong while uploading video");
        }
    
    return res.status(201).json({ success: true, message: "video uploaded successfully" });

})


const getVideoById = asyncHandler(async(req,res)=>{
    const{videoId}= req.params
})

const updateVideo = asyncHandler(async(req, res)=>{
    const {videoId}= req.params
})

const deleteVideo = asyncHandler(async(req, res)=>{
    const {videoId}= req.params
})

const toggelPublishStatus = asyncHandler(async(req,res)=>{
    const{videoId}= req.params
})

export {
    getAllVideo,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    toggelPublishStatus
}