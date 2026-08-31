
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { Like } from "../models/Like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?.id

    if (!videoId) {
        throw new ApiErrors(200, "comment id not found")
    }
    if (!userId) {
        throw new ApiErrors(200, "Login first to like the comment")
    }
    const like = await Like.findOne({
        likedBy: userId,
        video: videoId
    })

    console.log("value", like)
    if(!like){
       const liked = await Like.create({
       video : videoId,
        likedBy : userId
       })
       return res
       .status(200)
       .json(new ApiResponse(200, liked,"video liked"))
    }
    else{
        await Like.findOneAndDelete( {likedBy: userId,
        video: videoId})
        return res
       .status(200)
       .json(new ApiResponse(200, "video unLiked"))
    }
})
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user?.id

    if (! commentId) {
        throw new ApiErrors(200, "comment id not found")
    }
    if (!userId) {
        throw new ApiErrors(200, "Login first to like the comment")
    }
    const like = await Like.findOne({
        likedBy: userId,
        comment:  commentId
    })

    console.log("value", like)
    if(!like){
       const liked = await Like.create({
       comment :  commentId,
        likedBy : userId
       })
       return res
       .status(200)
       .json(new ApiResponse(200, liked,"comment liked"))
    }
    else{
        await Like.findOneAndDelete( {likedBy: userId,
        comment:  commentId})
        return res
       .status(200)
       .json(new ApiResponse(200, "comment unLiked"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user?.id

    if (! tweetId) {
        throw new ApiErrors(200, "comment id not found")
    }
    if (!userId) {
        throw new ApiErrors(200, "Login first to like the comment")
    }
    const like = await Like.findOne({
        likedBy: userId,
        tweet:  tweetId
    })

    console.log("value", like)
    if(!like){
       const liked = await Like.create({
       tweet :  tweetId,
        likedBy : userId
       })
       return res
       .status(200)
       .json(new ApiResponse(200, liked,"comment liked"))
    }
    else{
        await Like.findOneAndDelete( {likedBy: userId,
        tweet:  tweetId})
        return res
       .status(200)
       .json(new ApiResponse(200, "comment unLiked"))
    }
})

const getLikedVideo = asyncHandler(async(req, res)=>{
    const likedBy = req.user?.id
    if(!likedBy){
        throw new ApiErrors(200, "login first to see ")
    }
    const videos = await Like.find({likedBy})
    console.log("likedBy: ",likedBy)
    console.log("videos: ",videos)
    
    return res.status(400).json(new ApiResponse(200,"video fetched"))
})
export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideo }