import mongoose from "mongoose"
import {Video} from "../models/Video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/Like.model.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400, "Channel ID is required")
    }
    const totalVideos = await Video.countDocuments({owner: channelId})
    const totalSubscribers = await Subscription.countDocuments({channel: channelId})
    const [{totalLikes = 0} = {}] = await Video.aggregate([
        {
            $match: {owner: new mongoose.Types.ObjectId(channelId)}
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $addFields: {
                totalLikes: {$size: "$videoLikes"}
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {$sum: "$totalLikes"}
            }
        }
    ])

    
   

    return res.status(200).json(new ApiResponse(200, "Channel stats retrieved successfully", { totalVideos, totalSubscribers, totalLikes }))
})

const getChannelVideos = asyncHandler(async (req, res) => {

    const {channelId} = req.params 

    if (!channelId) {
        throw new ApiErrors(401, "Unauthorized request")
    }
    const videos = await Video.find({
        owner: channelId
    })
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Channel videos fetched successfully"
            )
        )
})

export {
    getChannelStats, 
    getChannelVideos
    }