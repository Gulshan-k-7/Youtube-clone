import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/User.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    const {channelId} = req.params;
    const userId = req.user?.id;
    if(!channelId){
        throw new ApiErrors(400, "Channel ID is required")
    }
    if(!userId){
        throw new ApiErrors(400, "User ID is required")
    }
    const subescription = await Subscription.findOneAndDelete({subscriber: userId, channel: channelId})

    if(subescription){
        return res.status(200).json(new ApiResponse(true, "Unsubscribed successfully"))
    }
  
    const newSubscription = await Subscription.create({
        subscriber: userId,
        channel: channelId
    })
    return res.status(200).json(new ApiResponse(true, "Subscribed successfully", newSubscription))

    })
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiErrors(200,"channel id required")
    }
    const subscribers = await (await Subscription.find({channel:channelId})).length
    console.log(subscribers)
    if(!subscribers){
        throw new ApiErrors(200,"0 subscribers")
    }
    return res.status(200).json(new ApiResponse(200,"subscribers", subscribers))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params;
    if(!subscriberId){
        throw new ApiErrors(200,"channel id required")
    }
    const channel = await (await Subscription.find({subscriber:subscriberId})).length
    
    if(!channel){
        throw new ApiErrors(200,"0 subscribers")
    }
    return res.status(200).json(new ApiResponse(200,"subscribers", channel))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}